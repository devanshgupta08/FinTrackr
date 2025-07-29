import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: ["income", "expense"],
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		 category: { 
        type: String,
        enum: [
            'Food',         
            'Transport',    
            'Shopping',
            'Bills',        
            'Entertainment',
            'Others'        
        ],
        default: 'Others'
    },
		description: { type: String },
		date: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true }
);

export const Transaction = mongoose.model("Transaction", TransactionSchema);