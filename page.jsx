"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useTransactions, useBudgets } from "@/app/utils/useStorage";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { transactions, addTransaction } = useTransactions();
  const { budgets } = useBudgets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const monthYear = currentDate.toISOString().slice(0, 7);

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const monthTransactions = transactions.filter((t) => {
    const txMonth = t.transaction_date.substring(0, 7);
    return txMonth === monthYear;
  });

  const totalIncome = monthTransactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const recentTransactions = monthTransactions.slice(0, 5).reverse();

  const chartData = [
    {
      month: currentDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      income: totalIncome,
      expenses: totalExpenses,
    },
  ];

  const budgetSummary = {
    total: budgets.reduce((sum, b) => sum + (parseFloat(b.budget_limit) || 0), 0),
    onTrack: budgets.filter((b) => {
      const spent = monthTransactions
        .filter((t) => t.category === b.category && t.transaction_type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      return spent <= parseFloat(b.budget_limit);
    }).length,
    overBudget: budgets.filter((b) => {
      const spent = monthTransactions
        .filter((t) => t.category === b.category && t.transaction_type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      return spent > parseFloat(b.budget_limit);
    }).length,
  };

  const handleAddTransaction = (formData) => {
    addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    setShowTransactionModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <p className="text-gray-500">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowTransactionModal(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={20} />
              Add Transaction
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-emerald-100">Current Balance</p>
                <Wallet size={20} className="text-emerald-100" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600">Income</p>
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600">Expenses</p>
                <TrendingDown size={20} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Income vs Expenses</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Budgets</h2>
                <a href="/budgets" className="text-emerald-600 text-sm hover:underline">
                  Manage →
                </a>
              </div>
              {budgets.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Budget</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(budgetSummary.total)}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 text-center p-3 bg-emerald-50 rounded-lg">
                      <p className="text-emerald-700 font-bold text-xl">{budgetSummary.onTrack}</p>
                      <p className="text-xs text-emerald-600 mt-1">On Track</p>
                    </div>
                    <div className="flex-1 text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-red-700 font-bold text-xl">{budgetSummary.overBudget}</p>
                      <p className="text-xs text-red-600 mt-1">Over Budget</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-4">No budgets set</p>
                  <a href="/budgets" className="text-emerald-600 text-sm hover:underline">
                    Set your first budget
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <a href="/transactions" className="text-emerald-600 text-sm hover:underline">
                View all →
              </a>
            </div>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === "income"
                            ? "bg-emerald-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {transaction.transaction_type === "income" ? (
                          <TrendingUp size={20} className="text-emerald-600" />
                        ) : (
                          <TrendingDown size={20} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.category} • {formatDate(transaction.transaction_date)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        transaction.transaction_type === "income"
                          ? "text-emerald-600"
                          : "text-gray-900"
                      }`}
                    >
                      {transaction.transaction_type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No transactions yet</div>
            )}
          </div>
        </div>
      </div>

      {showTransactionModal && (
        <TransactionModal
          onClose={() => setShowTransactionModal(false)}
          onSuccess={handleAddTransaction}
        />
      )}
    </div>
  );
}

function TransactionModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    transaction_type: "expense",
    category: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  if (!formData) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      onSuccess({
        description: formData.description,
        amount: parseFloat(formData.amount),
        transaction_type: formData.transaction_type,
        category: formData.category,
        transaction_date: formData.transaction_date,
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              required
              value={formData?.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData?.amount || ""}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData?.transaction_type || "expense"}
              onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              required
              value={formData?.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Salary, Food, Transport"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={formData?.transaction_date || ""}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
