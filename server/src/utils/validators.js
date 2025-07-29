import { z } from "zod";

// Complex validation functions
const isEmail = z
	.string()
	.min(1, "Email is required")
	.email("Invalid email format")
	.transform((email) => email.trim().toLowerCase());

const isUsername = z
	.string()
	.min(3, "Username must be at least 3 characters")
	.max(20, "Username must be at most 20 characters")
	.regex(
		/^[a-zA-Z0-9_]+$/,
		"Username can only contain letters, numbers, and underscores"
	);

const passwordComplexity = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.regex(/\d/, "Password must contain at least one number")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(
		/[!@#$%^&*(),.?":{}|<>]/,
		"Password must contain at least one special character"
	);

// !Schema definitions
const registrationSchema = z.object({
	username: isUsername,
	email: isEmail,
	password: passwordComplexity,
});

const loginSchema = z.object({
	usernameOrEmail: z
		.string()
		.min(1, "Username or Email is required")
		.refine(
			(value) =>
				isUsername.safeParse(value).success ||
				isEmail.safeParse(value).success,
			{
				message: "Invalid Username or Email format",
			}
		),
	password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
	oldPassword: z.string().min(1, "Old password is required"),
	newPassword: passwordComplexity,
});

 const transactionSchema = z.object({
    type: z.enum(["income", "expense"]),
    amount: z.number().positive(),
    category: z.enum(["Food", "Transport", "Shopping", "Bills", "Entertainment", "Others"]),
    description: z.string().optional(),
    date: z.string()  
});

 const multipleTransactionSchema = z.object({
  transactions: z.array(transactionSchema)
});
const updateUserSchema = z.object({
	email: isEmail,
});

// !Export schemas
export {
	registrationSchema,
	loginSchema,
	changePasswordSchema,
	updateUserSchema,
	transactionSchema,
	multipleTransactionSchema
};
