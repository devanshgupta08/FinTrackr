import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Dashboard route
const fetchDashboardData = asyncHandler(async (req, res) => {
	const [userCount, commentCount, postCount] = await Promise.all([
		User.aggregate([{ $count: "totalUsers" }])
	]);
	
	// Fetch recent data
	const recentUsers = await User.aggregate([
		{ $sort: { createdAt: -1 } },
		{ $limit: 5 },
		{ $project: { _id: 1, username: 1, email: 1 } },
	]);
	return res.status(200).json(
		new ApiResponse(
			200,
			{
				userCount: userCount[0]?.totalUsers || 0,
				recentUsers
			},
			"Dashboard data fetched successfully"
		)
	);
});

export { fetchDashboardData };
