import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store.js";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	Home,
	Login,
	Signup,
	Profile,
	Transactions,
	Analysis
} from "./pages/index.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
	Error,
	Users,
	Protected,
	Unauthorized,
} from "./components/index.js";


const queryClient = new QueryClient();

const nestedAdminRoute = {
	path: "admin",
	element: (
		<Protected authentication={true} adminOnly={true}>
			<div className="mx-8">
			<Users />
			</div>
		</Protected>
	)
};

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <Error />,
		children: [
			{
				path: "/unauthorized",
				element: <Unauthorized />,
			},
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/login",
				element: (
					<Protected authentication={false}>
						<Login />
					</Protected>
				),
			},
			{
				path: "/signup",
				element: (
					<Protected authentication={false}>
						<Signup />
					</Protected>
				),
			},
			
			{
				path: "/transaction",
				element: (
					<Protected authentication={true}>
						<Transactions/>
					</Protected>
				),
			},
			{
				path: "/analysis",
				element: (
					<Protected authentication={true}>
						<Analysis/>
					</Protected>
				),
			},
			{
				path: "/profile",
				element: (
					<Protected authentication={true}>
						<Profile />
					</Protected>
				),
			},
			nestedAdminRoute,
		],
	},
]);

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<QueryClientProvider client={queryClient}>
					<GoogleOAuthProvider clientId={clientId}>
						<RouterProvider router={router} />
					</GoogleOAuthProvider>
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</PersistGate>
		</Provider>
	</React.StrictMode>
);
