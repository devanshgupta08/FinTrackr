import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listTransactions } from "../api/transaction";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Container } from "../components";

// Colors for Pie Chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A855F7", "#F43F5E"];

const Analytics = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions-analytics"],
    queryFn: () => listTransactions(1, 1000, "", ""),
  });

  const transactions = data?.data?.data?.transactions || [];

  // --- KPI Calculations ---
  const { totalIncome, totalExpense, netSavings, biggestCategory, largestIncomeSource } = useMemo(() => {
    let income = 0, expense = 0;
    const expenseMap = {};
    const incomeMap = {};

    transactions.forEach(tx => {
      if (tx.type === "income") {
        income += tx.amount;
        incomeMap[tx.category] = (incomeMap[tx.category] || 0) + tx.amount;
      } else {
        expense += tx.amount;
        expenseMap[tx.category] = (expenseMap[tx.category] || 0) + tx.amount;
      }
    });

    const biggestCat = Object.keys(expenseMap).length
      ? Object.keys(expenseMap).reduce((a, b) => expenseMap[a] > expenseMap[b] ? a : b)
      : "N/A";

    const largestIncome = Object.keys(incomeMap).length
      ? Object.keys(incomeMap).reduce((a, b) => incomeMap[a] > incomeMap[b] ? a : b)
      : "N/A";

    return {
      totalIncome: income,
      totalExpense: expense,
      netSavings: income - expense,
      biggestCategory: biggestCat,
      largestIncomeSource: largestIncome,
    };
  }, [transactions]);

  // --- Monthly Income vs Expense ---
  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(tx => {
      const month = new Date(tx.date).toLocaleString("default", { month: "short", year: "numeric" });
      if (!map[month]) map[month] = { month, income: 0, expense: 0 };
      if (tx.type === "income") map[month].income += tx.amount;
      else map[month].expense += tx.amount;
    });
    return Object.values(map).sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [transactions]);

  // --- Expense Breakdown by Category ---
  const expenseCategoryData = useMemo(() => {
    const map = {};
    transactions.forEach(tx => {
      if (tx.type === "expense") {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    });
    return Object.keys(map).map(key => ({ name: key, value: map[key] }));
  }, [transactions]);

  // --- Income Breakdown by Category ---
  const incomeCategoryData = useMemo(() => {
    const map = {};
    transactions.forEach(tx => {
      if (tx.type === "income") {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    });
    return Object.keys(map).map(key => ({ name: key, value: map[key] }));
  }, [transactions]);

  if (isLoading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (isError) return <div className="flex justify-center mt-10">Error fetching analytics</div>;

  return (
    <Container className="my-10">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="card bg-base-100 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow">
          <div className="card-body">
            <h2 className="card-title">Total Income</h2>
            <p className="text-green-500 font-bold text-xl">₹ {totalIncome}</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow">
          <div className="card-body">
            <h2 className="card-title">Total Expense</h2>
            <p className="text-red-500 font-bold text-xl">₹ {totalExpense}</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow">
          <div className="card-body">
            <h2 className="card-title">Net Savings</h2>
            <p className="text-blue-500 font-bold text-xl">₹ {netSavings}</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow">
          <div className="card-body">
            <h2 className="card-title">Biggest Expense</h2>
            <p className="text-purple-500 font-bold text-xl">{biggestCategory}</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow">
          <div className="card-body">
            <h2 className="card-title">Largest Income Source</h2>
            <p className="text-green-500 font-bold text-xl">{largestIncomeSource}</p>
          </div>
        </div>
      </div>

      {/* MONTHLY BAR CHART */}
      <div className="card bg-base-100 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow mb-8">
        <div className="card-body">
          <h2 className="card-title">Monthly Income vs Expense</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#4ADE80" name="Income" />
              <Bar dataKey="expense" fill="#F87171" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SIDE-BY-SIDE PIE CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-100 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow">
          <div className="card-body">
            <h2 className="card-title">Expense Breakdown by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%" cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-exp-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-100 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors shadow">
          <div className="card-body">
            <h2 className="card-title">Income Breakdown by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeCategoryData}
                  cx="50%" cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#82ca9d"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeCategoryData.map((entry, index) => (
                    <Cell key={`cell-inc-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Analytics;
