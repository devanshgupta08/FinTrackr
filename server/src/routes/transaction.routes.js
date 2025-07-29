import { Router } from "express";
import {
	addTransaction,
	listTransactions,
	getTransactionById,
	deleteTransaction,
	addMultipleTransactions,
    addTransactionsFromPDF,
    addTransactionsFromReceipt
} from "../controllers/transaction.controllers.cjs";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { transactionSchema } from "../utils/validators.js";
import { multipleTransactionSchema } from "../utils/validators.js";

const router = Router();
router.post(
	"/import-pdf",
	verifyJWT,
	(req, res, next) => {
		upload.single("file")(req, res, (err) => {
			if (err) return res.status(400).json({ message: err.message });
			next();
		});
	},
	addTransactionsFromPDF
);
router.post(
	"/receipt",
	verifyJWT,
	(req, res, next) => {
		upload.single("file")(req, res, (err) => {
			if (err) return res.status(400).json({ message: err.message });
			next();
		});
	},
	addTransactionsFromReceipt
);
router
	.route("/add")
	.post(verifyJWT, validate(transactionSchema), addTransaction);
router
	.route("/add-many")
	.post(
		verifyJWT,
		validate(multipleTransactionSchema),
		addMultipleTransactions
	);

router.route("/list").get(verifyJWT, listTransactions);

router.route("/:transactionId").get(verifyJWT, getTransactionById);

router.route("/:transactionId").delete(verifyJWT, deleteTransaction);

export default router;
