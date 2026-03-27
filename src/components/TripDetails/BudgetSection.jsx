import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Receipt, PlusCircle, Trash2, TrendingDown, Coffee, Plane, Home, Box } from 'lucide-react';

const CATEGORY_COLORS = {
  Food: 'bg-orange-100 text-orange-700 border-orange-200',
  Travel: 'bg-blue-100 text-blue-700 border-blue-200',
  Stay: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Misc: 'bg-gray-100 text-gray-700 border-gray-200'
};

const CATEGORY_ICONS = {
  Food: <Coffee className="w-4 h-4" />,
  Travel: <Plane className="w-4 h-4" />,
  Stay: <Home className="w-4 h-4" />,
  Misc: <Box className="w-4 h-4" />
};

const BudgetSection = ({ trip, tripId }) => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !tripId) return;

    const expensesRef = collection(db, 'users', currentUser.uid, 'trips', tripId, 'expenses');
    const q = query(expensesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData);
    });

    return () => unsubscribe();
  }, [currentUser, tripId]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setLoading(true);
    try {
      const expensesRef = collection(db, 'users', currentUser.uid, 'trips', tripId, 'expenses');
      await addDoc(expensesRef, {
        title,
        amount: parseFloat(amount),
        category,
        createdAt: serverTimestamp()
      });
      setTitle('');
      setAmount('');
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const expenseRef = doc(db, 'users', currentUser.uid, 'trips', tripId, 'expenses', expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const totalBudget = parseFloat(trip.budgetAmount) || 0;
  const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column - Stats & Adding Form */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Budget Summary Card */}
        <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <h3 className="text-teal-100 font-bold tracking-wide uppercase text-sm mb-6 flex items-center gap-2">
            <Receipt className="w-4 h-4" /> Trip Budget Summary
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-teal-100/80 text-sm mb-1">Total Budget</p>
              <p className="text-3xl font-bold">${totalBudget.toFixed(2)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-teal-500/50">
              <div>
                <p className="text-teal-100/80 text-sm mb-1">Spent</p>
                <p className="text-xl font-bold text-red-200">${totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-teal-100/80 text-sm mb-1">Remaining</p>
                <p className={`text-xl font-bold ${remainingBudget < 0 ? 'text-red-300' : 'text-green-300'}`}>
                  ${remainingBudget.toFixed(2)}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-teal-900/50 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${totalSpent > totalBudget ? 'bg-red-400' : 'bg-teal-300'}`} 
                style={{ width: `${Math.min((totalSpent / (totalBudget || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-teal-600" /> Add Expense
          </h3>
          
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Expense Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Dinner at beachfront"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium appearance-none"
                >
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Stay">Stay</option>
                  <option value="Misc">Misc</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <PlusCircle className="w-5 h-5"/>}
              Add Expense
            </button>
          </form>
        </div>
        
      </div>

      {/* Right Column - Expenses List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 h-full flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Transaction History</h3>
          
          {expenses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Receipt className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No expenses tracked yet.</p>
              <p className="text-sm text-gray-400 mt-1">Add your first booking or meal to see it here!</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[600px] custom-scrollbar">
              {expenses.map(exp => (
                <div key={exp.id} className="group p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-100 transition-all flex items-center justify-between">
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${CATEGORY_COLORS[exp.category]} bg-opacity-50`}>
                      {CATEGORY_ICONS[exp.category]}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{exp.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${CATEGORY_COLORS[exp.category]}`}>
                          {exp.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {exp.createdAt?.toDate ? exp.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-black text-gray-800 text-lg">
                      ${exp.amount.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default BudgetSection;
