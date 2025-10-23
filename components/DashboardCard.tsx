import React from 'react';
import type { DashboardCardProps } from '../types';

const DashboardCard: React.FC<DashboardCardProps> = ({ title, count, icon, onClick }) => {
  const cardClasses = `
    bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 flex items-center space-x-4 
    transition-all duration-300
    ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-gray-300 hover:-translate-y-1' : ''}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {count !== null && (
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{count}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;