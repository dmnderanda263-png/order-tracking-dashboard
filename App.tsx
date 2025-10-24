import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AddNewParcel from './components/AddNewParcel';
import AllParcels from './components/AllParcels';
import FinancePage from './components/FinancePage';
import DataAnalytics from './components/DataAnalytics';
import Login from './components/Login';
import AdminProfile from './components/AdminProfile';
import ImportParcels from './components/ImportParcels';
import DataManagement from './components/DataManagement';
import Notification from './components/Notification';
import TrackParcel from './components/TrackParcel';
import ReturnManagement from './components/ReturnManagement';
import { DashboardCardProps, Parcel, ParcelStatus, AdminData, NotificationMessage, AppBackup } from './types';
import {
  AllParcelsIcon, RescheduleParcelsIcon, DeliveredParcelsIcon, RearrangeParcelsIcon, 
  ReturnParcelsIcon, ReturnHandoverCompleteIcon, ParcelTrackingIcon, BulkTrackingIcon
} from './components/Icons';
import useLocalStorage from './hooks/useLocalStorage';
import { sampleParcels } from './data';

const initialCardData: DashboardCardProps[] = [
    { title: 'All Parcels', count: 0, icon: <AllParcelsIcon /> },
    { title: 'Reschedule Parcels', count: 0, icon: <RescheduleParcelsIcon /> },
    { title: 'Delivered Parcels', count: 0, icon: <DeliveredParcelsIcon /> },
    { title: 'Pending To Deliver', count: 0, icon: <RearrangeParcelsIcon /> },
    { title: 'Return Parcels', count: 0, icon: <ReturnParcelsIcon /> },
    { title: 'Return Handover Complete', count: 0, icon: <ReturnHandoverCompleteIcon /> },
    { title: 'Parcel Tracking', count: null, icon: <ParcelTrackingIcon /> },
    { title: 'Bulk Tracking', count: null, icon: <BulkTrackingIcon /> },
  ];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [parcels, setParcels] = useLocalStorage<Parcel[]>('parcels', sampleParcels);
  const [cardData, setCardData] = useState<DashboardCardProps[]>(initialCardData);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  
  const [adminData, setAdminData] = useLocalStorage<AdminData>('adminData', {
    name: 'Admin User',
    password: '9502',
  });
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('isAuthenticated', false);

  const [githubToken, setGithubToken] = useLocalStorage<string>('githubToken', '');
  const [gistId, setGistId] = useLocalStorage<string>('gistId', '');

  const showNotification = (message: string, type: 'success' | 'error' | 'warning', duration: number = 4000) => {
    setNotification({ message, type });
    setTimeout(() => {
        setNotification(null);
    }, duration);
  };

  useEffect(() => {
    const counts = {
      'All Parcels': parcels.length,
      'Pending To Deliver': parcels.filter(p => p.status === 'Pending to Deliver').length,
      'Delivered Parcels': parcels.filter(p => p.status === 'Delivered' || p.status === 'Payment Received').length,
      'Return Parcels': parcels.filter(p => p.status === 'Returned').length,
      'Reschedule Parcels': parcels.filter(p => p.status === 'Rescheduled').length,
      'Return Handover Complete': parcels.filter(p => p.status === 'Return Complete').length,
    };

    setCardData(prevData =>
      prevData.map(card => ({
        ...card,
        count: counts[card.title as keyof typeof counts] ?? card.count,
      }))
    );
  }, [parcels]);

  const handleLogin = (password: string): boolean => {
    if (password === adminData.password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const handleUpdateAdminName = (newName: string) => {
    if (newName.trim()) {
      setAdminData({ ...adminData, name: newName.trim() });
      showNotification('Admin name updated successfully!', 'success');
    } else {
      showNotification('Admin name cannot be empty.', 'error');
    }
  };

  const handleUpdatePassword = (oldPassword: string, newPassword: string) => {
    if (oldPassword !== adminData.password) {
        showNotification('Incorrect old password.', 'error');
        return { success: false, message: 'Incorrect old password.' };
    }
    if (newPassword.length < 4) {
        showNotification('New password must be at least 4 characters long.', 'error');
        return { success: false, message: 'New password must be at least 4 characters long.' };
    }
    setAdminData({ ...adminData, password: newPassword });
    showNotification('Password updated successfully!', 'success');
    return { success: true, message: 'Password updated successfully!' };
  };

  const handleResetPassword = () => {
    setAdminData({ ...adminData, password: '9502' });
    showNotification('Password has been reset to the default.', 'success');
  };

  const handleAddParcel = (newParcelData: Pick<Parcel, 'trackingNumber' | 'customerName' | 'customerAddress' | 'customerMobile' | 'parcelValue'>): boolean => {
    if (parcels.some(p => p.trackingNumber.trim().toLowerCase() === newParcelData.trackingNumber.trim().toLowerCase())) {
        showNotification(`A parcel with tracking number "${newParcelData.trackingNumber}" already exists.`, 'error');
        return false;
    }

    const now = new Date().toISOString();
    const newParcel: Parcel = {
      ...newParcelData,
      id: Date.now(),
      status: 'Pending to Deliver',
      creationDate: now,
      statusHistory: [{ status: 'Pending to Deliver', timestamp: now }],
    };
    setParcels(prevParcels => [...prevParcels, newParcel]);
    showNotification('Parcel added successfully!', 'success');
    return true;
  };
  
  const handleBulkAddParcels = (newParcelsData: Pick<Parcel, 'trackingNumber' | 'customerName' | 'customerAddress' | 'customerMobile' | 'parcelValue'>[]): { added: number, skipped: number } => {
    const now = new Date().toISOString();
    let addedCount = 0;
    
    setParcels(prevParcels => {
        const existingNumbers = new Set(prevParcels.map(p => p.trackingNumber.trim().toLowerCase()));
        
        const parcelsToAdd: Parcel[] = [];
        
        newParcelsData.forEach((p, index) => {
            const trimmedTrackingNumber = p.trackingNumber.trim().toLowerCase();
            if (!existingNumbers.has(trimmedTrackingNumber)) {
                parcelsToAdd.push({
                    ...p,
                    id: Date.now() + index,
                    status: 'Pending to Deliver',
                    creationDate: now,
                    statusHistory: [{ status: 'Pending to Deliver', timestamp: now }],
                });
                existingNumbers.add(trimmedTrackingNumber); // Prevent duplicates within the same file
            }
        });
        
        addedCount = parcelsToAdd.length;
        return [...prevParcels, ...parcelsToAdd];
    });

    const skippedCount = newParcelsData.length - addedCount;
    return { added: addedCount, skipped: skippedCount };
  };

  const handleUpdateParcelStatus = (parcelId: number, newStatus: ParcelStatus) => {
    setParcels(prevParcels =>
      prevParcels.map(p => {
        if (p.id === parcelId) {
          const newHistoryEntry = { status: newStatus, timestamp: new Date().toISOString() };
          return { 
            ...p, 
            status: newStatus, 
            statusHistory: [...p.statusHistory, newHistoryEntry] 
          };
        }
        return p;
      })
    );
  };

  const handleBulkUpdateParcelStatus = (parcelIds: number[], newStatus: ParcelStatus) => {
    const now = new Date().toISOString();
    setParcels(prevParcels =>
      prevParcels.map(p => {
        if (parcelIds.includes(p.id)) {
          const newHistoryEntry = { status: newStatus, timestamp: now };
          return { 
            ...p, 
            status: newStatus, 
            statusHistory: [...p.statusHistory, newHistoryEntry] 
          };
        }
        return p;
      })
    );
    showNotification(`${parcelIds.length} parcel(s) updated to "${newStatus}".`, 'success');
  };

  const handleEditParcel = (updatedParcel: Parcel) => {
    setParcels(prevParcels =>
        prevParcels.map(p => (p.id === updatedParcel.id ? updatedParcel : p))
    );
    showNotification('Parcel details updated.', 'success');
  };

  const handleDeleteParcel = (parcelId: number) => {
      setParcels(prevParcels => prevParcels.filter(p => p.id !== parcelId));
      showNotification('Parcel deleted successfully.', 'success');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && currentPage !== 'all-parcels') {
      setCurrentPage('all-parcels');
    }
  };

  const handleExportBackup = () => {
    const backupData: AppBackup = {
        appName: 'NethuFashionOrderTracker',
        version: 1,
        parcels,
        adminData,
    };
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nethu-fashion-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Backup file has been downloaded.', 'success');
  };

  const handleImportBackup = (jsonData: string) => {
    try {
        const backupData: AppBackup = JSON.parse(jsonData);

        if (backupData.appName !== 'NethuFashionOrderTracker' || !backupData.parcels || !backupData.adminData) {
            throw new Error('Invalid or corrupted backup file.');
        }

        if (window.confirm('Are you sure you want to restore from this backup? All current data will be permanently overwritten.')) {
            setParcels(backupData.parcels);
            setAdminData(backupData.adminData);
            showNotification('Data successfully restored from backup!', 'success');
            setCurrentPage('dashboard');
        }
    } catch (error) {
        console.error("Restore error:", error);
        showNotification(error instanceof Error ? error.message : 'Failed to restore data.', 'error');
    }
  };

  const renderContent = () => {
    const allParcelsProps = {
        onUpdateStatus: handleUpdateParcelStatus,
        onEditParcel: handleEditParcel,
        onDeleteParcel: handleDeleteParcel,
        onBulkUpdateStatus: handleBulkUpdateParcelStatus,
        searchQuery: searchQuery,
        setSearchQuery: setSearchQuery,
        showNotification: showNotification,
    };
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard cardData={cardData} setCurrentPage={setCurrentPage} />;
      case 'add-new-parcel':
        return <AddNewParcel onAddParcel={handleAddParcel} />;
      case 'import-parcels':
        return <ImportParcels onBulkAddParcels={handleBulkAddParcels} />;
      case 'all-parcels':
        return <AllParcels parcels={parcels} title="All Parcel Details" {...allParcelsProps} />;
      case 'pending-to-deliver':
        const pendingParcels = parcels.filter(p => p.status === 'Pending to Deliver');
        return <AllParcels parcels={pendingParcels} title="Parcels Pending To Deliver" {...allParcelsProps} />;
      case 'delivered-parcels':
        const deliveredParcels = parcels.filter(p => p.status === 'Delivered' || p.status === 'Payment Received');
        return <AllParcels parcels={deliveredParcels} title="Delivered Parcels" {...allParcelsProps} />;
      case 'returned-parcels':
        const returnedParcels = parcels.filter(p => p.status === 'Returned');
        return <AllParcels parcels={returnedParcels} title="Returned Parcels" {...allParcelsProps} />;
      case 'rescheduled-parcels':
        const rescheduledParcels = parcels.filter(p => p.status === 'Rescheduled');
        return <AllParcels parcels={rescheduledParcels} title="Rescheduled Parcels" {...allParcelsProps} />;
      case 'pending-payments':
        const pendingAmount = parcels
          .filter(p => p.status === 'Pending to Deliver')
          .reduce((sum, p) => sum + (parseFloat(p.parcelValue) || 0), 0);
        return <FinancePage title="Pending Payments" amount={pendingAmount} currency="LKR" />;
      case 'received-payments':
        const receivedAmount = parcels
          .filter(p => p.status === 'Delivered' || p.status === 'Payment Received')
          .reduce((sum, p) => sum + (parseFloat(p.parcelValue) || 0), 0);
        return <FinancePage title="Received Payments" amount={receivedAmount} currency="LKR" />;
      case 'parcel-volume-analysis':
        return <DataAnalytics parcels={parcels} analysisType="volume" />;
      case 'financial-overview':
        return <DataAnalytics parcels={parcels} analysisType="finance" />;
      case 'parcel-tracking':
        return <TrackParcel parcels={parcels} />;
      case 'return-management':
        return <ReturnManagement 
                  parcels={parcels.filter(p => p.status === 'Returned')}
                  onBulkUpdateStatus={handleBulkUpdateParcelStatus}
                  showNotification={showNotification}
               />;
      case 'return-handover-complete':
        const completedReturns = parcels.filter(p => p.status === 'Return Complete');
        return <AllParcels parcels={completedReturns} title="Return Handover Complete" {...allParcelsProps} />;
      case 'admin-profile':
        return <AdminProfile 
                  adminData={adminData} 
                  onUpdatePassword={handleUpdatePassword} 
                  onResetPassword={handleResetPassword}
                  onUpdateAdminName={handleUpdateAdminName} 
               />;
      case 'data-management':
        return <DataManagement 
                  onExport={handleExportBackup} 
                  onImport={handleImportBackup} 
                  parcels={parcels}
                  adminData={adminData}
                  githubToken={githubToken}
                  setGithubToken={setGithubToken}
                  gistId={gistId}
                  setGistId={setGistId}
                  showNotification={showNotification}
               />;
      default:
        return <Dashboard cardData={cardData} setCurrentPage={setCurrentPage} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 text-gray-800">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen relative">
        {notification && (
            <Notification 
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
            />
        )}
        <Header searchQuery={searchQuery} onSearch={handleSearch} adminName={adminData.name} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;