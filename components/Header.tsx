import React from 'react';
import { SearchIcon, BellIcon, QuestionMarkCircleIcon } from './Icons';

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  adminName: string;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearch, adminName }) => {
  const adminInitial = adminName ? adminName.charAt(0).toUpperCase() : 'A';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-10">
      <div className="flex items-center justify-between h-20 px-8">
        {/* Left Section: Brand */}
        <div className="flex items-center space-x-3">
           <svg className="h-8 w-auto text-blue-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 13l-10-5 10-5 10 5-10 5z"/>
           </svg>
          <span className="text-2xl font-bold text-gray-800 tracking-tight">Nethu Fashion</span>
        </div>

        {/* Middle Section: Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders, products, customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center space-x-6">
          <button className="text-gray-500 hover:text-gray-700 relative">
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <QuestionMarkCircleIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {adminInitial}
             </div>
             <div>
                <p className="text-sm font-semibold text-gray-800">{adminName}</p>
                <p className="text-xs text-gray-500">admin@nethufashion.com</p>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;