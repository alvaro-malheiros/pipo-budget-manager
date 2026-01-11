
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 overflow-hidden relative border-x border-gray-200 shadow-xl">
      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {children}
      </main>

      {/* Tab Bar (Sticky Bottom) */}
      <nav className="ios-blur border-t border-gray-200 h-20 fixed bottom-0 left-0 right-0 max-w-md mx-auto flex items-center justify-around px-4 safe-area-bottom z-50">
        <TabButton 
          active={activeView === View.DASHBOARD} 
          onClick={() => onViewChange(View.DASHBOARD)}
          label="Home"
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>}
        />
        <TabButton 
          active={activeView === View.TRANSACTIONS} 
          onClick={() => onViewChange(View.TRANSACTIONS)}
          label="Transactions"
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>}
        />
        <TabButton 
          active={activeView === View.STATS} 
          onClick={() => onViewChange(View.STATS)}
          label="Stats"
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>}
        />
        <TabButton 
          active={activeView === View.AI_ADVISOR} 
          onClick={() => onViewChange(View.AI_ADVISOR)}
          label="Insights"
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>}
        />
      </nav>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, icon }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-colors ${active ? 'text-blue-600' : 'text-gray-400'}`}
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );
};

export default Layout;
