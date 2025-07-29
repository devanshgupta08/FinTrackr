import React, { useState } from "react";
import { Container } from "../components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";
import {
  addTransaction,
  listTransactions,
  deleteTransaction,
  importTransactionsFromPDF,
  importTransactionsFromReceipt
} from "../api/transaction";

const Transactions = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "Food",
    description: "",
    date: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [posFile, setPosFile] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const limit = 5;

  const { data, isLoading, isError, isPreviousData, refetch } = useQuery({
    queryKey: ["transactions", page, startDate, endDate],
    queryFn: () => listTransactions(page, limit, startDate, endDate),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTransaction(id),
    onSuccess: () => queryClient.invalidateQueries(["transactions"]),
  });

  const mutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      setFormData({
        type: "expense",
        amount: "",
        category: "Food",
        description: "",
        date: "",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: importTransactionsFromPDF,
    onSuccess: () => queryClient.invalidateQueries(["transactions"]),
  });
  const importReceiptMutation = useMutation({
    mutationFn: importTransactionsFromReceipt,
    onSuccess: () => queryClient.invalidateQueries(["transactions"]),
  });
  const handleFilterApply = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPage(1);
    setFilterOpen(false);
    refetch();
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setPage(1);
    setFilterOpen(false);
    refetch();
  };

  const handleDelete = (id) => deleteMutation.mutate(id);

  const handlePDFImport = () => {
    if (!pdfFile) return alert("Please select a PDF file");
    importMutation.mutate(pdfFile);
  };

 const handlePOSImport = () => {
  if (!posFile) return alert("Please select a photo file");
    importReceiptMutation.mutate(posFile);
//   console.log(posFile);
//   if (!posFile) return alert("Please select a POS receipt image");

//   const formData = new FormData();
//   formData.append("file", posFile);
//   for (let [key, value] of formData.entries()) {
//   console.log(key, value);
// }
//   importReceiptMutation.mutate(formData, {
//     onSuccess: () => {
//       alert("POS receipt imported successfully!");
//       setPosFile(null);
//     },
//     onError: () => {
//       alert("Failed to import POS receipt");
//     },
//   });
};


  const transactions = data?.data?.data?.transactions || [];
  const currentPage = data?.data?.data?.currentPage || 1;
  const totalPages = data?.data?.data?.totalPages || 1;

  return (
    <Container className="my-10">
      <h1 className="text-2xl font-bold mb-4">Add Transaction</h1>

      {/* -------- Top Split (Left form / Right PDF+POS) -------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* -------- Left Side (Existing Fields) -------- */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              ...formData,
              amount: Number(formData.amount),
              date: new Date(formData.date).toISOString(),
            };
            mutation.mutate(payload);
          }}
          className="grid grid-cols-1 gap-4 p-6 shadow rounded bg-base-100 transition-transform transform hover:scale-[1.02] hover:shadow-lg"
        >
          <select
            className="select select-bordered w-full"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            className="input input-bordered w-full"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <select
            className="select select-bordered w-full"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Others">Others</option>
          </select>
          <input
            type="date"
            className="input input-bordered w-full"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="textarea textarea-bordered w-full"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <button className="btn btn-primary" type="submit">
            {mutation.isLoading ? "Adding..." : "Add Transaction"}
          </button>
        </form>

        {/* -------- Right Side (Insert from PDF & POS) -------- */}
        <div className="flex flex-col gap-8 p-6 shadow rounded bg-base-100 transition-transform transform hover:scale-[1.01] hover:shadow-lg">
          {/* --- Import from PDF --- */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Insert from PDF</h2>
            <input
              type="file"
              accept="application/pdf"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
            <button
              className="btn btn-primary w-full"
              onClick={handlePDFImport}
              disabled={importMutation.isLoading}
            >
              {importMutation.isLoading ? "Importing..." : "Insert from PDF"}
            </button>
          </div>

          {/* --- Insert from POS Receipt --- */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Insert from POS Receipt</h2>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setPosFile(e.target.files[0])}
            />
            <button className="btn btn-primary w-full" onClick={handlePOSImport}>
              Insert from POS Receipt
            </button>
          </div>
        </div>
      </div>

      {/* -------- Heading + Filter Button -------- */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Transactions</h2>
        <div className="relative">
          <button
            className="btn btn-outline"
            onClick={() => setFilterOpen((prev) => !prev)}
          >
            Filter by Date
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-2 w-64 z-10 card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-4">
                <label className="label">
                  <span className="label-text">Start Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full mb-3"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                />
                <label className="label">
                  <span className="label-text">End Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full mb-3"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    className="btn btn-outline w-1/2"
                    onClick={handleClearFilter}
                    type="button"
                  >
                    Clear
                  </button>
                  <button
                    className="btn btn-primary w-1/2"
                    onClick={handleFilterApply}
                    type="button"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Table ---- */}
      {isLoading ? (
        <div className="flex justify-center items-center  w-full">
          <div className="loading loading-spinner loading-lg"></div>
        </div>

      ) : isError ? (
        <div>Error loading transactions</div>
      ) : (
        <div className="overflow-x-auto">
          {transactions.length > 0 ? (
            <>
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td className="capitalize">{tx.type}</td>
                      <td className={tx.type === "expense" ? "text-red-400" : "text-green-400"}>
                        {tx.type === "expense" ? `-${tx.amount}` : `+${tx.amount}`}
                      </td>
                      <td>{tx.category}</td>
                      <td>{new Date(tx.date).toLocaleDateString()}</td>
                      <td>{tx.description}</td>
                      <td>
                        <button
                          className="btn btn-ghost text-red-500"
                          onClick={() => handleDelete(tx._id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center items-center mt-4 gap-4">
                <button
                  className="btn btn-primary"
                  onClick={() => setPage((old) => Math.max(old - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setPage((old) => (!isPreviousData && old < totalPages ? old + 1 : old))
                  }
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">No transactions available</div>
          )}
        </div>
      )}
    </Container>
  );
};

export default Transactions;
