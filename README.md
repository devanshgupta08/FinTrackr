# **Final GitHub README**

````markdown
# ✨ Finance Tracker 📊

> A **full-stack personal finance management app** built with the **MERN stack** (MongoDB, Express.js, React, Node.js), designed to simplify expense tracking, financial analysis, and secure user authentication.  
>  
> 🎥 **[Watch Demo Video](<YOUR_VIDEO_LINK_HERE>)**

---

## 🌟 Features Overview

### 🔐 User Authentication (Email + Google OAuth)
- Secure login and signup with email & password  
- **Google OAuth login** for quick authentication  
- JWT-based session handling for safe and persistent login

---

### 💰 Transactions Management
- Add, update, and delete **income & expense** records  
- Categorize transactions for better organization  
- View complete transaction history at any time

---

### 📥 Bulk Data Import from PDF
- Upload **PDF files** containing transaction data  
- Automatically parse and extract data  
- Add multiple transactions **in bulk** with one click

---

### 📄 Receipt Import (POS)
- Upload **POS receipts** directly  
- Automatically extract **transaction date** and **total amount** using regex parsing  
- Quick conversion of paper receipts into digital transactions

---

### 📊 Analytics & Insights
**Three powerful visualizations to understand your finances:**
1. **Category-wise Expense Distribution (Pie Chart)** – See which categories take the biggest share of your spending.  
2. **Income vs Expense Overview (Bar Chart)** – Track monthly or yearly trends of earnings vs expenses.  
3. **Cash Flow Trend (Line Graph)** – Monitor financial health and flow over time.

---

### 📅 Date Filter for Transactions
- Filter transactions by **start date** and **end date**  
- Easily analyze spending within specific periods  
- Works seamlessly with pagination & analytics

---

### 🌓 Dark / Light Theme Toggle
- Switch between **light and dark modes** instantly  
- Theme preference is saved and persists between sessions

---

### 👤 Profile Management
- Update profile information like name and email  
- Change password securely  
- Upload & manage profile avatar image

---

### 📑 Pagination (Frontend & Backend)
- **Backend Pagination:** Efficient transaction fetching using query parameters (`page`, `limit`)  
- **Frontend Pagination:** Smooth page navigation for large transaction lists  
- Improves performance and user experience when handling big data

---

## 🛠️ Technologies Used

| Layer        | Tech Stack                                                                     |
|--------------|---------------------------------------------------------------------------------|
| **Frontend** | React, React Router DOM, Redux Toolkit, React Query, TailwindCSS, DaisyUI      |
| **Backend**  | Node.js, Express.js, MongoDB, Mongoose, Multer, Cloudinary, JWT                |
| **Auth**     | Google OAuth, bcrypt                                                           |
| **Utilities**| Regex Parsing for Receipts, PDF Parser, CORS, FormData                         |

---

## 🚀 Project Setup

### **Prerequisites**
- Node.js >= 16
- MongoDB running locally or Atlas connection string

### **Steps to Run Locally**
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/finance-tracker.git
   cd finance-tracker
````

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment variables**
   Create a `.env` file in both **backend** and **frontend** with:

   ```
   # Backend .env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLOUDINARY_URL=your_cloudinary_url

   # Frontend .env
   VITE_API_URL=http://localhost:8000
   ```

4. **Run the app**

   ```bash
   # Run backend
   cd backend
   npm run dev

   # Run frontend
   cd ../frontend
   npm start
   ```

5. **Open in browser**

   * Frontend: `http://localhost:3000`
   * Backend: `http://localhost:8000`

---

## 🎥 Demo

👉 **[Watch Demo Video](YOUR_VIDEO_LINK_HERE)**

---

```
