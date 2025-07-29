import api from "./axiosConfig";

// Add new transaction
const addTransaction = async (data) => {
    return await api.post("/transaction/add", data);
};

// List transactions with pagination and optional date range
const listTransactions = async (page = 1, limit = 10, start, end) => {
    return await api.get("/transaction/list", {
        params: {
            page,
            limit,
            start,
            end,
        },
    });
};

// Get a single transaction by ID
const getTransactionById = async (transactionId) => {
    return await api.get(`/transaction/${transactionId}`);
};
const importTransactionsFromPDF = async (file) => {
    const formData = new FormData();
    formData.append("file", file); 
    return await api.post("/transaction/import-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
const importTransactionsFromReceipt = async (file) => {
    const formData = new FormData();
    formData.append("file", file); 
    return await api.post("/transaction/receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
// Delete a transaction by ID
const deleteTransaction = async (transactionId) => {
    return await api.delete(`/transaction/${transactionId}`);
};

export {
    addTransaction,
    listTransactions,
    getTransactionById,
    deleteTransaction,
    importTransactionsFromPDF,
    importTransactionsFromReceipt
};
