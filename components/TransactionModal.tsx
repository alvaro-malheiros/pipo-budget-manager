
import React, { useState, useEffect } from 'react';
import { CategoryType, Transaction } from '../types';
import { CATEGORIES } from '../constants';

interface TransactionModalProps {
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Partial<Omit<Transaction, 'id'>>;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ onClose, onSave, initialData }) => {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState<CategoryType>(initialData?.category || 'Outros');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onSave({
      amount: parseFloat(amount),
      type,
      category,
      description: description || category,
      date
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {initialData ? 'Confirmar Transação' : 'Nova Transação'}
            </h3>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                type="button" 
                onClick={() => setType('expense')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
              >
                Gasto
              </button>
              <button 
                type="button" 
                onClick={() => setType('income')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
              >
                Renda
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">$</span>
                <input 
                  type="number" 
                  autoFocus={!initialData}
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categoria</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium"
                >
                  {CATEGORIES.filter(c => c.name !== 'Income').map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                  {type === 'income' && <option value="Income">Renda</option>}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Data</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descrição</label>
              <input 
                type="text" 
                placeholder="Onde você gastou?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button 
              type="submit"
              className={`w-full py-4 mt-4 text-white font-bold rounded-2xl transition-transform active:scale-95 ${type === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              {initialData ? 'Confirmar' : `Adicionar ${type === 'expense' ? 'Gasto' : 'Renda'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
