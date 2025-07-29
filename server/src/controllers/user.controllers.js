import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
	deleteFromCloudinary,
	uploadOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import generatePassword from "generate-password";

const generateAccessAndRefreshToken = async (id) => {
	try {
		const user = await User.findById(id);
		const accessToken = await user.generateAccessToken();
		const refreshToken = await user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(
			500,
			"Something went wrong while generating Access and Refresh tokens"
		);
	}
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthHandler = asyncHandler(async (req, res) => {
	const { token } = req.body;

	if (!token) {
		throw new ApiError(400, "Google token is required");
	}

	// Verify the Google token
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.GOOGLE_CLIENT_ID,
	});

	const { email, picture } = ticket.getPayload();

	// Check for existing user using email
	let user = await User.findOne({ email: email.toLowerCase() });

	if (!user) {
		// Create a secure random password
		const password = generatePassword.generate({
			length: 12,
			numbers: true,
			symbols: true,
			uppercase: true,
			lowercase: true,
			strict: true,
		});

		// Generate a unique username
		let username = email.split("@")[0].toLowerCase();
		let usernameExists = await User.findOne({ username });
		while (usernameExists) {
			username = username + Math.random().toString(36).slice(-4);
			usernameExists = await User.findOne({ username });
		}

		// Create new user if doesn't exist
		user = await User.create({
			username,
			email: email.toLowerCase(),
			avatar: picture,
			password
		});
	}

	const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
		user._id
	);

	const options = {
		httpOnly: true,
		secure: true,
		sameSite: 'None',
	};

	const userObject = user.toObject();
	delete userObject.password;
	delete userObject.refreshToken;

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{
					user: userObject,
					accessToken,
					refreshToken,
				},
				"User authenticated successfully with Google"
			)
		);
});

const registerUser = asyncHandler(async (req, res) => {
	// Get data from the request
	const { username, email, password } = req.body;

	// Check for existing user using username and email
	const existingUser = await User.findOne({
		$or: [
			{ username: username.toLowerCase() },
			{ email: email.toLowerCase() },
		],
	});

	if (existingUser) {
		throw new ApiError(400, "User with username or email already exists");
	}

	// Handle avatar upload if present
	let avatarCloudUrl = null;
	const avatarLocalPath = req?.file?.path;

	if (avatarLocalPath) {
		const avatarCloudObject = await uploadOnCloudinary(avatarLocalPath);
		avatarCloudUrl = avatarCloudObject?.url;

		if (!avatarCloudUrl) {
			throw new Error("Avatar upload failed");
		}
	}

	// Create new document in the database
	const user = await User.create({
		email: email.toLowerCase(),
		password,
		username: username.toLowerCase(),
		avatar: avatarCloudUrl,
	});

	// Check for the created user and exclude password and refreshToken
	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken"
	);

	if (!createdUser) {
		throw new ApiError(
			500,
			"Something went wrong while registering the user in the database"
		);
	}

	// Return the data by removing sensitive fields
	return res
		.status(201)
		.json(
			new ApiResponse(201, createdUser, "User registered Successfully")
		);
});

const loginUser = asyncHandler(async (req, res) => {
	// 1. take the data from the user
	// 2. validate the data -> error
	// 3. check for the user in the database using email/username -> error
	// 4. if found check password -> error
	// 5. generate access and refresh token
	// 6. return through cookies

	const { usernameOrEmail, password } = req.body;

	const user = await User.findOne({
		$or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
	});

	if (!user) {
		throw new ApiError(400, "Invalid username or email");
	}

	const passwordCorrect = await user.isPasswordCorrect(password);

	if (!passwordCorrect) {
		throw new ApiError(400, "Invalid password");
	}

	const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
		user._id
	);

	const options = {
		httpOnly: true,
		secure: true,
		sameSite: 'None',
	};

	const userObject = user.toObject(); // Convert to plain object

	delete userObject.password;
	delete userObject.refreshToken;

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{
					user: userObject,
					accessToken,
					refreshToken,
				},
				"user logged in successfully"
			)
		);
});

const logoutUser = asyncHandler(async (req, res) => {
	const user = await User.findByIdAndUpdate(
		req.user._id,
		{
			$set: {
				refreshToken: null, // Use null instead of undefined
			},
		},
		{
			new: true,
		}
	);

	if (!user) {
		throw new ApiError(400, "Failed to update user refreshToken");
	}

	const options = {
		httpOnly: true,
		secure: true,
		sameSite: 'None',
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponse(200, {}, "User logged out successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const deletedUser = await User.findByIdAndDelete(userId);
	if (!deletedUser) {
		throw new ApiError(500, "Something went wrong while deleting the user");
	}
	return res
		.status(200)
		.json(new ApiResponse(200, deletedUser, "user deleted successfully"));
});

const allUsers = asyncHandler(async (req, res) => {
	const users = await User.aggregate([
		{
			$sort: {
				createdAt: -1,
			},
		},
		{
			$project: {
				_id: 1,
				username: 1,
				email: 1,
				avatar: 1,
				role: 1,
				createdAt: 1,
				updatedAt: 1,
			},
		},
	]);

	return res
		.status(200)
		.json(new ApiResponse(200, users, "all users returned successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
	// check for refresh token in req -> error
	// verify using jwt and decode
	// find user from the db using id
	// verify if same
	// generate access token in cooken as well as body

	const incomingRefreshToken =
		req.cookies.refreshToken || req.body.refreshToken;

	if (!incomingRefreshToken) {
		throw new ApiError(
			401,
			"Unauthorized request - refresh token required"
		);
	}

	try {
		const decodedToken = jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET
		);

		if (!decodedToken) {
			throw new ApiError(401, "Invalid refresh token");
		}

		const user = await User.findById(decodedToken._id);

		if (!user) {
			throw new ApiError(401, "User does not exist");
		}


		if (incomingRefreshToken !== user.refreshToken) {
			throw new ApiError(401, "Invalid refresh token");
		}

		const { accessToken, refreshToken } =
			await generateAccessAndRefreshToken(user._id);

		const options = {
			httpOnly: true,
			secure: true,
			sameSite: 'None',
		};

		res.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", refreshToken, options)
			.json(
				new ApiResponse(
					200,
					{
						accessToken,
						refreshToken,
					},
					"new tokens generated successfully"
				)
			);
	} catch (error) {
		throw new ApiError(401, error?.message || "Invalid refresh token");
	}
});

const changeExistingPassword = asyncHandler(async (req, res) => {
	// verify jwt token
	// validate password
	// get existing and new password
	// get user
	// verify password
	// set new password
	// const errors = validationResult(req);
	// if (!errors.isEmpty()) {
	// 	return res.status(400).json({ errors: errors.array() });
	// }

	const { oldPassword, newPassword } = req.body;

	if (oldPassword === newPassword) {
		throw new ApiError(400, "new password and old password cannot be same");
	}

	const user = await User.findById(req.user._id);

	const correctPassword = await user.isPasswordCorrect(oldPassword);

	if (!correctPassword) {
		throw new ApiError(400, "Invalid password");
	}

	// !the pre hook of mongoose will not be triggered with find and update method
	user.password = newPassword;
	await user.save();

	res.status(200).json(
		new ApiResponse(200, {}, "password changed successfully")
	);
});

const updateUserFields = asyncHandler(async (req, res) => {
	const { email } = req.body;

	const existingUser = await User.findOne({ email: email.toLowerCase() });

	if (existingUser) {
		throw new ApiError(400, "Email is already taken");
	}

	// Find and update user
	const user = await User.findByIdAndUpdate(
		req.user._id,
		{
			email,
		},
		{
			new: true,
		}
	).select("-password -refreshToken");

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Return updated user
	return res
		.status(200)
		.json(new ApiResponse(200, user, "User updated successfully"));
});

const getUser = asyncHandler(async (req, res) => {
	
	return res.status(200).json(
		new ApiResponse(
			200,
			{
				user: req.user,
			},
			"current user returned successfully"
		)
	);
});

const updateAvatar = asyncHandler(async (req, res) => {
	// get new avatar file -> error
	// upload new on cloudinary -> error
	// update in the database
	// delete prev from db

	const newAvatarLocalPath = req.file?.path;

	if (!newAvatarLocalPath) {
		throw new ApiError(400, "new Avatar file required");
	}

	const newAvatarCloudObject = await uploadOnCloudinary(newAvatarLocalPath);

	const newAvatarCloudUrl = newAvatarCloudObject?.url;
	// const newAvatarPublicId = newAvatarCloudObject?.public_id;

	if (!newAvatarCloudUrl) {
		throw new ApiError(
			500,
			"unable to upload new avatar file on cloudinary"
		);
	}

	const user = await User.findByIdAndUpdate(req.user._id, {
		$set: {
			avatar: newAvatarCloudUrl,
		},
	});

	const oldAvatarUrl = user.avatar;
	const publicId = oldAvatarUrl
		? oldAvatarUrl.split("/").slice(-1)[0].split(".")[0]
		: null;

	await deleteFromCloudinary(publicId);

	user.avatar = newAvatarCloudUrl;

	return res
		.status(200)
		.json(new ApiResponse(200, user, "avatar changed successfully"));
});


const adminDeleteUser = asyncHandler(async (req, res) => {
	const userId = req.params?.userId;
	if(!userId){
		throw new ApiError(400, "User id required");
	}
	const deletedUser = await User.findByIdAndDelete(userId);
	if (!deletedUser) {
		throw new ApiError(500, "Something went wrong while deleting the user");
	}
	return res
		.status(200)
		.json(new ApiResponse(200, deletedUser, "user deleted successfully"));
})
const makeAdmin = asyncHandler(async (req, res) => {
	const userId = req.params?.userId;
	if(!userId){
		throw new ApiError(400, "User id required");
	}
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	if (user.role === "admin") {
		throw new ApiError(400, "User is already an admin");
	}
	user.role = "admin";
	await user.save();
	return res
		.status(200)
		.json(new ApiResponse(200, user, "User role updated to admin"));
})
const dismissAdmin = asyncHandler(async (req, res) => {
	const userId = req.params?.userId;
	if(!userId){
		throw new ApiError(400, "User id required");
	}
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	if (user.role === "user") {
		throw new ApiError(400, "User is not an admin");
	}
	if(userId.toString() === req.user._id.toString()){
		throw new ApiError(400, "You cannot dismiss yourself from admin role");
	}
	user.role = "user";
	await user.save();
	return res
		.status(200)
		.json(new ApiResponse(200, user, "User dismissed from admin role"));
})
export {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	changeExistingPassword,
	updateUserFields,
	getUser,
	updateAvatar,
	deleteUser,
	allUsers,
	googleAuthHandler,
	adminDeleteUser,
	makeAdmin,
	dismissAdmin
};
