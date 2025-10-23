import React from 'react';

interface FinancePageProps {
  title: string;
  amount: number;
  currency: string;
}

const FinancePage: React.FC<FinancePageProps> = ({ title, amount, currency }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-8 max-w-sm">
        <p className="text-lg text-gray-500 font-medium">{title}</p>
        <p className="text-4xl font-bold text-gray-900 tracking-tight mt-2">
          {currency} {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default FinancePage;
