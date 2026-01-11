
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, BudgetGoal, View, AppState, CategoryType } from './types';
import { INITIAL_TRANSACTIONS, CATEGORIES } from './constants';
import Layout from './components/Layout';
import TransactionModal from './components/TransactionModal';
import { getBudgetInsights, extractReceiptData } from './services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from 'recharts';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<Partial<Omit<Transaction, 'id'>> | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fintrack_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  
  // Budgets initialized with Meta values from the user's spreadsheet screenshot
  const [budgets, setBudgets] = useState<BudgetGoal[]>([
    { category: 'Alimentação', limit: 48 },
    { category: 'Supermercados', limit: 11 },
    { category: 'Transporte', limit: 7 },
    { category: 'Farmácia', limit: 6 },
    { category: 'Pet', limit: 4 },
    { category: 'Auto', limit: 1351 },
    { category: 'Cursos', limit: 1000 },
    { category: 'Assistência médica', limit: 0 },
    { category: 'Viagens', limit: 0 },
    { category: 'Contas', limit: 450 },
    { category: 'Assinaturas', limit: 908 },
    { category: 'Faxina', limit: 890 },
    { category: 'Compras', limit: 930 },
    { category: 'Outros', limit: 866 },
    { category: 'Serviços', limit: 0 },
    { category: 'Tabacaria', limit: 0 },
    { category: 'Psicólogo', limit: 0 },
    { category: 'Fotografia', limit: 0 },
  ]);

  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction = { ...newTx, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [transaction, ...prev]);
    setScannedData(null);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleScanReceipt = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const categoryNames = CATEGORIES.map(c => c.name);
        const data = await extractReceiptData(base64String, file.type, categoryNames);
        setScannedData({
          amount: data.amount,
          description: data.merchant,
          date: data.date,
          type: 'expense',
          category: data.category
        });
        setIsModalOpen(true);
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      alert("Erro ao ler recibo. Tente novamente.");
    }
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const categorySpending = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    const result = await getBudgetInsights(transactions, budgets);
    setAiInsights(result);
    setIsLoadingInsights(false);
  };

  // Groups for the Performance Panel as seen in screenshot
  const group1 = ['Alimentação', 'Supermercados', 'Transporte', 'Farmácia', 'Pet'];
  const group2 = ['Auto', 'Cursos', 'Assistência médica', 'Viagens', 'Contas', 'Assinaturas', 'Faxina', 'Compras', 'Outros'];

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" capture="environment" className="hidden" />

      <div className="p-6 pt-10 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {activeView === View.DASHBOARD && 'Visão Geral'}
            {activeView === View.TRANSACTIONS && 'Histórico'}
            {activeView === View.STATS && 'Painel de Metas'}
            {activeView === View.AI_ADVISOR && 'Insights IA'}
          </h1>
          <div className="flex gap-2">
            <button onClick={handleScanReceipt} disabled={isScanning} className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full shadow-sm active:scale-90 transition-transform disabled:opacity-50">
              {isScanning ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            </button>
            <button onClick={() => { setScannedData(null); setIsModalOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg active:scale-90 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>

        {activeView === View.DASHBOARD && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl">
              <p className="text-blue-100 text-sm font-medium mb-1">Saldo Total</p>
              <h2 className="text-4xl font-bold mb-6">${stats.balance.toLocaleString()}</h2>
              <div className="flex justify-between gap-4">
                <div className="flex-1 bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                  <p className="text-xs text-blue-100 mb-1">Renda</p>
                  <p className="text-lg font-bold text-white">+${stats.income.toLocaleString()}</p>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                  <p className="text-xs text-blue-100 mb-1">Gastos</p>
                  <p className="text-lg font-bold text-white">-${stats.expense.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Quick Add Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setScannedData(null); setIsModalOpen(true); }}
                className="flex items-center justify-center gap-3 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm active:scale-95 transition-all hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <span className="font-bold text-gray-800">Novo Gasto</span>
              </button>
              <button 
                onClick={handleScanReceipt}
                className="flex items-center justify-center gap-3 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm active:scale-95 transition-all hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span className="font-bold text-gray-800">Scan Recibo</span>
              </button>
            </div>

            {/* Recent Spending Snapshot */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Últimos Lançamentos</h3>
                <button onClick={() => setActiveView(View.TRANSACTIONS)} className="text-blue-600 text-sm font-semibold">Ver tudo</button>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 3).map(t => {
                   const config = CATEGORIES.find(c => c.name === t.category);
                   return (
                    <div key={t.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-white ${config?.color || 'bg-gray-400'}`}>{config?.icon}</div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{t.description}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-medium">{t.category}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-gray-900'}`}>{t.type === 'income' ? '+' : '-'}${t.amount}</span>
                    </div>
                   );
                })}
              </div>
            </div>
          </div>
        )}

        {activeView === View.TRANSACTIONS && (
          <div className="space-y-4">
            {transactions.map(t => {
              const config = CATEGORIES.find(c => c.name === t.category);
              return (
                <div key={t.id} className="group flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all hover:border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl text-white ${config?.color || 'bg-gray-400'}`}>{config?.icon}</div>
                    <div>
                      <p className="font-bold text-gray-900">{t.description}</p>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">{t.category} • {t.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`font-bold text-lg ${t.type === 'income' ? 'text-emerald-500' : 'text-gray-900'}`}>{t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}</span>
                    <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 text-red-400 text-[10px] font-bold uppercase transition-opacity">Excluir</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeView === View.STATS && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
               <div className="bg-black text-white p-3 text-center text-xs font-bold uppercase tracking-widest">Painel de Gastos Diários</div>
               <table className="w-full text-sm">
                  <thead className="bg-amber-400 text-gray-900 text-xs uppercase">
                    <tr>
                      <th className="py-2 px-4 text-left">Categoria</th>
                      <th className="py-2 px-2 text-center">Meta</th>
                      <th className="py-2 px-2 text-center">Real</th>
                      <th className="py-2 px-2 text-center bg-white border-l border-gray-100">%VAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {group1.map(cat => {
                      const budget = budgets.find(b => b.category === cat)?.limit || 0;
                      const real = transactions.filter(t => t.category === cat && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                      const varPct = budget === 0 ? (real > 0 ? 100 : 0) : Math.round(((real - budget) / budget) * 100);
                      
                      return (
                        <tr key={cat} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-gray-700">{cat}</td>
                          <td className="py-3 px-2 text-center text-gray-500">{budget}</td>
                          <td className="py-3 px-2 text-center font-medium">{real}</td>
                          <td className={`py-3 px-2 text-center font-bold border-l border-gray-100 ${varPct > 0 ? 'bg-red-200 text-red-800' : varPct < 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50'}`}>
                            {varPct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
               <div className="bg-black text-white p-3 text-center text-xs font-bold uppercase tracking-widest">Custos Fixos e Grandes</div>
               <table className="w-full text-sm">
                  <thead className="bg-amber-400 text-gray-900 text-xs uppercase">
                    <tr>
                      <th className="py-2 px-4 text-left">Categoria</th>
                      <th className="py-2 px-2 text-center">Meta</th>
                      <th className="py-2 px-2 text-center">Real</th>
                      <th className="py-2 px-2 text-center bg-white border-l border-gray-100">VAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {group2.map(cat => {
                      const budget = budgets.find(b => b.category === cat)?.limit || 0;
                      const real = transactions.filter(t => t.category === cat && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                      const variance = real - budget;
                      
                      return (
                        <tr key={cat} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-gray-700">{cat}</td>
                          <td className="py-3 px-2 text-center text-gray-500">{budget}</td>
                          <td className="py-3 px-2 text-center font-medium">{real}</td>
                          <td className={`py-3 px-2 text-center font-bold border-l border-gray-100 ${variance > 0 ? 'bg-red-200 text-red-800' : variance < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-600'}`}>
                            {variance}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-6 text-center">Resumo de Gastos</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categorySpending} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {categorySpending.map((entry, index) => <Cell key={`cell-${index}`} fill={CATEGORIES.find(c => c.name === entry.name)?.color.replace('bg-', '') || '#8884d8'} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeView === View.AI_ADVISOR && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl text-center relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-2">Assistente Inteligente</h2>
              <button onClick={fetchInsights} disabled={isLoadingInsights} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50">
                {isLoadingInsights ? 'Analisando...' : 'Obter Insights'}
              </button>
            </div>
            {aiInsights.map((insight, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-indigo-500 flex gap-4">
                <p className="text-gray-700 font-medium leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && <TransactionModal onClose={() => { setIsModalOpen(false); setScannedData(null); }} onSave={addTransaction} initialData={scannedData || undefined} />}
    </Layout>
  );
};

export default App;
