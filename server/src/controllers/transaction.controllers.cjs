const { asyncHandler } = require("../utils/AsyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { Transaction } = require("../models/transaction.models");
const mongoose = require("mongoose");
const fs = require('fs');
const pdf = require('pdf-parse');
const Tesseract = require("tesseract.js");
const path = require("path");

async function extractPOSReceiptData(imagePath,userID) {
  // OCR read text from receipt image
  const { data: { text } } = await Tesseract.recognize(imagePath, "eng");

  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

  let receiptDate = null;
  let totalAmount = null;

  const dateRegex = /\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}\b/;
  const totalRegex = /total\s*[:\-]?\s*\$?\s*([\d,]+(\.\d{2})?)/i;

  for (const line of lines) {
    // find date
    const dateMatch = line.match(dateRegex);
    if (dateMatch && !receiptDate) {
      receiptDate = dateMatch[0];
    }

    // find total amount
    const totalMatch = line.match(totalRegex);
    if (totalMatch) {
      totalAmount = totalMatch[1].replace(",", "");
    }
  }

  // fallback if date not found → use today
  const dateISO = receiptDate
    ? new Date(receiptDate).toISOString()
    : new Date().toISOString();

  // fallback if no total found → 0
  const amount = totalAmount ? parseFloat(totalAmount) : 0;

  // Create final JSON object
  const transaction = {
    type: "expense",
    amount,
    category: "Bills",
    description: "POS receipt",
    date: dateISO,
    user:userID
  };

  return transaction;
}

const addTransactionsFromReceipt = asyncHandler(async (req, res) => {
    let imagePath = req?.file?.path;
    if (!imagePath) throw new ApiError(400, "No PNG file uploaded");
    let transaction = await extractPOSReceiptData(imagePath,req.user._id);
    console.log(transaction);
    await Transaction.create(transaction);
    return res.status(201).json(
        new ApiResponse(201, { transaction}, "Transactions processed successfully")
    );
});

const addTransactionsFromPDF = asyncHandler(async (req, res) => {
    if (!req?.file?.path) throw new ApiError(400, "No PDF file uploaded");

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);
    const text = data.text.trim();

    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");

    const transactions = [];
    const skipped = [];

    lines.forEach((line) => {
        const parts = line.trim().split(/\s{2,}/);

        if (parts.length < 5) {
            skipped.push({ line, reason: "Insufficient fields" });
            return;
        }

        const [type, amount, category, description, dateStr] = parts;
        const parsedDate = new Date(dateStr);

        if (isNaN(parsedDate)) {
            skipped.push({ line, reason: "Invalid date format" });
            return;
        }

        transactions.push({
            type: type.trim().toLowerCase(),
            amount: Number(amount),
            category: category.trim(),
            description: description.trim(),
            date: parsedDate.toISOString(),
            user: req.user._id,
        });
    });

    if (transactions.length > 0) {
        await Transaction.insertMany(transactions);
    }

    return res.status(201).json(
        new ApiResponse(201, { inserted: transactions.length, skipped,transactions }, "Transactions processed successfully")
    );
});


/**
 * Add a new income/expense transaction
 */
const addTransaction = asyncHandler(async (req, res) => {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !date) {
        throw new ApiError(400, "Type, amount and date are required");
    }

    const transaction = await Transaction.create({
        user: req.user._id,
        type,
        amount,
        category,
        description,
        date,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, transaction, "Transaction added successfully"));
});
/**
 * Add multiple transactions at once
 */


const addMultipleTransactions = asyncHandler(async (req, res) => {
    const { transactions } = req.body; // Already validated by Zod

    // Add user reference and convert date to Date object
    const formattedTransactions = transactions.map(tx => ({
        ...tx,
        user: req.user._id,
        date: new Date(tx.date)
    }));

    const insertedTransactions = await Transaction.insertMany(formattedTransactions);

    return res.status(201).json(
        new ApiResponse(201, insertedTransactions, "Transactions added successfully")
    );
});


/**
 * List transactions with optional pagination and date range filter
 */
const listTransactions = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const startDate = req.query.start ? new Date(req.query.start) : null;
    const endDate = req.query.end ? new Date(req.query.end) : null;

    let matchStage = { user: new mongoose.Types.ObjectId(req.user._id) };
    if (startDate && endDate) {
        matchStage.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
        matchStage.date = { $gte: startDate };
    } else if (endDate) {
        matchStage.date = { $lte: endDate };
    }

    const totalTransactions = await Transaction.countDocuments(matchStage);

    const pipeline = [
        { $match: matchStage },
        { $sort: { date: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
    ];

    const transactions = await Transaction.aggregate(pipeline);

    const response = {
        transactions,
        totalTransactions,
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
    };

    return res
        .status(200)
        .json(new ApiResponse(200, response, "Transactions returned successfully"));
});

/**
 * Get a single transaction by ID
 */

const getTransactionById = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        throw new ApiError(400, "Invalid transaction ID");
    }

    const transaction = await Transaction.findOne({
        _id: transactionId,
        user: req.user._id,
    });

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, transaction, "Transaction fetched successfully"));
});

/**
 * Delete a transaction
 */
const deleteTransaction = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        throw new ApiError(400, "Invalid transaction ID");
    }

    const deletedTransaction = await Transaction.findOneAndDelete({
        _id: transactionId,
        user: req.user._id,
    });

    if (!deletedTransaction) {
        throw new ApiError(404, "Transaction not found or already deleted");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedTransaction, "Transaction deleted successfully"));
});

module.exports = {
    addTransaction,
    listTransactions,
    getTransactionById,
    deleteTransaction,
    addMultipleTransactions,
    addTransactionsFromPDF,
    addTransactionsFromReceipt
};
