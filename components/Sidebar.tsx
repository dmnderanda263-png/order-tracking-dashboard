import React, { useState } from 'react';
import { NavItemType } from '../types';
import { 
    DashboardIcon, ClockRewindIcon, CashIcon, UserCircleIcon, ChevronRightIcon, PackageIcon, 
    ChevronDownIcon, PlusCircleIcon, DocumentReportIcon, ChartBarIcon, LogoutIcon, UploadIcon, DatabaseIcon, DocumentSearchIcon
} from './Icons';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
}

const navItems: NavItemType[] = [
  { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
  { 
    id: 'parcel-management', 
    icon: <PackageIcon />, 
    label: 'Parcel Management', 
    hasSubmenu: true,
    submenu: [
      { id: 'add-new-parcel', icon: <PlusCircleIcon className="h-5 w-5"/>, label: 'Add New Parcel' },
      { id: 'import-parcels', icon: <UploadIcon className="h-5 w-5"/>, label: 'Import Parcels' },
    ]
  },
  { 
    id: 'finance', 
    icon: <CashIcon />, 
    label: 'Finance',
    hasSubmenu: true,
    submenu: [
      { id: 'pending-payments', icon: <ClockRewindIcon className="h-5 w-5"/>, label: 'Pending Payments' },
      { id: 'received-payments', icon: <CashIcon className="h-5 w-5"/>, label: 'Received Payments' }
    ]
  },
  {
    id: 'analytics',
    icon: <DocumentReportIcon />,
    label: 'Data Analytics',
    hasSubmenu: true,
    submenu: [
      { id: 'parcel-volume-analysis', icon: <ChartBarIcon className="h-5 w-5" />, label: 'Parcel Volume' },
      { id: 'financial-overview', icon: <CashIcon className="h-5 w-5" />, label: 'Financial Overview' }
    ]
  },
  { id: 'parcel-tracking', icon: <DocumentSearchIcon />, label: 'Parcel Tracking' },
  { id: 'admin-profile', icon: <UserCircleIcon />, label: 'Admin Profile' },
  { id: 'data-management', icon: <DatabaseIcon />, label: 'Data Management' },
  { id: 'return-management', icon: <ClockRewindIcon />, label: 'Return Management' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onLogout }) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('parcel-management');

  const handleNavClick = (item: NavItemType) => {
    if (item.hasSubmenu) {
      setOpenSubmenu(prev => (prev === item.id ? null : item.id));
    } else {
      setCurrentPage(item.id);
    }
  };
  
  return (
    <aside className="w-72 bg-blue-800 text-white flex flex-col p-4">
      <div className="py-4 px-2">
        <h2 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">MAIN</h2>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id || (item.submenu?.some(sub => sub.id === currentPage) ?? false);
            const isSubmenuOpen = openSubmenu === item.id;

            return (
              <li key={item.id}>
                <div 
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.hasSubmenu && (isSubmenuOpen ? <ChevronDownIcon /> : <ChevronRightIcon />)}
                </div>
                {isSubmenuOpen && item.submenu && (
                  <ul className="pl-8 pt-2 space-y-1">
                    {item.submenu.map(subItem => {
                       const isSubActive = currentPage === subItem.id;
                       return (
                        <li 
                          key={subItem.id}
                          onClick={() => setCurrentPage(subItem.id)}
                          className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                            isSubActive ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-700/50 hover:text-white'
                          }`}
                        >
                          {subItem.icon}
                          <span className="text-sm font-medium">{subItem.label}</span>
                        </li>
                       )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="pt-4 border-t border-blue-700/50">
        <div 
          onClick={onLogout}
          className="flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 text-blue-100 hover:bg-red-500 hover:text-white"
        >
          <div className="flex items-center gap-4">
            <LogoutIcon />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;