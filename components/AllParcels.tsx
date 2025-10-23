import React, { useState, useEffect, useMemo } from 'react';
import { Parcel, ParcelStatus } from '../types';
import { PencilIcon, TrashIcon, PrintIcon, ExportIcon, InformationCircleIcon, DocumentDownloadIcon } from './Icons';
import Pagination from './Pagination';

declare const jspdf: any;

interface AllParcelsProps {
  parcels: Parcel[];
  title: string;
  onUpdateStatus: (parcelId: number, newStatus: ParcelStatus) => void;
  onEditParcel: (updatedParcel: Parcel) => void;
  onDeleteParcel: (parcelId: number) => void;
  onBulkUpdateStatus: (parcelIds: number[], newStatus: ParcelStatus) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const ITEMS_PER_PAGE = 10;

const StatusBadge: React.FC<{ status: ParcelStatus }> = ({ status }) => {
  const statusClasses: Record<ParcelStatus, string> = {
    'Pending to Deliver': 'bg-yellow-100 text-yellow-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Payment Received': 'bg-blue-100 text-blue-800',
    'Returned': 'bg-red-100 text-red-800',
    'Rescheduled': 'bg-purple-100 text-purple-800',
    'Return Complete': 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

const StatusHistoryTooltip: React.FC<{ history: Parcel['statusHistory'] }> = ({ history }) => (
    <div className="text-left">
        <h4 className="font-bold mb-2 border-b pb-1">Status History</h4>
        <ul className="space-y-1">
            {[...history].reverse().map((item, index) => (
                <li key={index} className="text-xs">
                    <span className="font-semibold">{item.status}:</span>
                    <span className="text-gray-300 ml-2">
                        {new Date(item.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

const EditParcelModal: React.FC<{
  parcel: Parcel;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedParcel: Parcel) => void;
}> = ({ parcel, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(parcel);

  useEffect(() => {
    setFormData(parcel);
  }, [parcel]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg m-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Parcel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
           {Object.keys(formData).map(key => {
              if (['id', 'status', 'creationDate', 'statusHistory'].includes(key)) return null;
              
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

              return (
                 <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type={key === 'parcelValue' ? 'number' : 'text'}
                      name={key}
                      id={key}
                      value={formData[key as keyof typeof formData] as string}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                 </div>
              );
           })}
           <div className="flex justify-end gap-3 pt-4">
             <button
               type="button"
               onClick={onClose}
               className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors"
             >
               Cancel
             </button>
             <button
               type="submit"
               className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
             >
               Save Changes
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};


const AllParcels: React.FC<AllParcelsProps> = ({ parcels, title, onUpdateStatus, onEditParcel, onDeleteParcel, onBulkUpdateStatus, searchQuery, setSearchQuery, showNotification }) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [selectedParcelIds, setSelectedParcelIds] = useState<number[]>([]);
  const [bulkActionStatus, setBulkActionStatus] = useState<ParcelStatus>('Delivered');
  const [currentPage, setCurrentPage] = useState(1);
  const [parcelsToPrint, setParcelsToPrint] = useState<Parcel[]>([]);
  
  const [tooltip, setTooltip] = useState<{ content: React.ReactNode; x: number; y: number } | null>(null);

  const showTooltip = (content: React.ReactNode, e: React.MouseEvent) => {
    setTooltip({ content, x: e.clientX, y: e.clientY });
  };
  const hideTooltip = () => setTooltip(null);


  const getActionOptions = (status: ParcelStatus): ParcelStatus[] => {
    const allStatuses: ParcelStatus[] = ['Pending to Deliver', 'Delivered', 'Payment Received', 'Returned', 'Rescheduled', 'Return Complete'];
    return allStatuses.filter(s => s !== status);
  };

  const handleClearFilters = () => {
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleEditClick = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (parcelId: number) => {
    if(window.confirm('Are you sure you want to delete this parcel? This action cannot be undone.')) {
        onDeleteParcel(parcelId);
    }
  };
  
  const filteredParcels = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();

    const result = parcels.filter(parcel => {
      if (statusFilter !== 'All' && parcel.status !== statusFilter) {
        return false;
      }
      if (parcel.creationDate) {
          const parcelDate = new Date(parcel.creationDate);
          if (startDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              if (parcelDate < start) return false;
          }
          if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              if (parcelDate > end) return false;
          }
      } else if (startDate || endDate) {
          return false;
      }

      if (searchQuery.length >= 3) {
        return (
          parcel.trackingNumber.toLowerCase().includes(lowerCaseQuery) ||
          parcel.customerName.toLowerCase().includes(lowerCaseQuery) ||
          parcel.customerAddress.toLowerCase().includes(lowerCaseQuery)
        );
      }

      return true;
    });

    if (searchQuery.length >= 3) {
      const getScore = (parcel: Parcel): number => {
        let score = 0;
        const name = parcel.customerName.toLowerCase();
        const tracking = parcel.trackingNumber.toLowerCase();
        const address = parcel.customerAddress.toLowerCase();

        // Higher priority for customer name matches
        if (name.includes(lowerCaseQuery)) score += 10;
        if (name.startsWith(lowerCaseQuery)) score += 5; // Bonus for starting match

        // Medium for tracking number
        if (tracking.includes(lowerCaseQuery)) score += 5;

        // Lower for address
        if (address.includes(lowerCaseQuery)) score += 2;
        
        return score;
      };

      return result.sort((a, b) => getScore(b) - getScore(a));
    }
    
    return result.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());

}, [parcels, statusFilter, startDate, endDate, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, startDate, endDate, searchQuery, parcels]);

  useEffect(() => {
    setSelectedParcelIds([]);
  }, [statusFilter, startDate, endDate, searchQuery]);


  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedParcelIds(paginatedParcels.map(p => p.id));
    } else {
      setSelectedParcelIds([]);
    }
  };

  const handleSelectOne = (parcelId: number) => {
    setSelectedParcelIds(prev =>
      prev.includes(parcelId)
        ? prev.filter(id => id !== parcelId)
        : [...prev, parcelId]
    );
  };

  const handleApplyBulkAction = () => {
    if (selectedParcelIds.length > 0) {
      onBulkUpdateStatus(selectedParcelIds, bulkActionStatus);
      setSelectedParcelIds([]);
    } else {
      showNotification('No parcels selected for bulk action.', 'warning');
    }
  };

  const handlePrint = () => {
    const selected = parcels.filter(p => selectedParcelIds.includes(p.id));
    if (selected.length === 0) {
        showNotification("Please select one or more parcels to print.", "warning");
        return;
    }
    setParcelsToPrint(selected);
    setTimeout(() => {
        window.print();
        setParcelsToPrint([]);
    }, 100); 
  };
  
  const handlePrintSingle = (parcelToPrint: Parcel) => {
    setParcelsToPrint([parcelToPrint]);
    setTimeout(() => {
        window.print();
        setParcelsToPrint([]);
    }, 100); 
  };

  const handleExport = () => {
    const parcelsToExport = selectedParcelIds.length > 0
      ? parcels.filter(p => selectedParcelIds.includes(p.id))
      : filteredParcels;

    if (parcelsToExport.length === 0) {
      showNotification("There are no parcels to export with the current filters.", "warning");
      return;
    }

    const headers = [
      'TrackingNumber', 'CustomerName', 'CustomerAddress', 'CustomerMobile', 
      'ParcelValue (LKR)', 'Status', 'CreationDate'
    ];
    
    const escapeCsvField = (field: string | number) => {
      const stringField = String(field);
      if (/[",\n]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const csvRows = parcelsToExport.map(p => [
        escapeCsvField(p.trackingNumber),
        escapeCsvField(p.customerName),
        escapeCsvField(p.customerAddress),
        escapeCsvField(p.customerMobile),
        escapeCsvField(parseFloat(p.parcelValue).toFixed(2)),
        escapeCsvField(p.status),
        escapeCsvField(new Date(p.creationDate).toLocaleDateString('en-GB')),
    ].join(','));

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `parcels-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    const parcelsToExport = selectedParcelIds.length > 0
      ? parcels.filter(p => selectedParcelIds.includes(p.id))
      : filteredParcels;
  
    if (parcelsToExport.length === 0) {
      showNotification("There are no parcels to export with the current filters.", "warning");
      return;
    }
  
    const doc = new jspdf.jsPDF();
    const tableColumn = ["Tracking #", "Customer Name", "Address", "Value (LKR)", "Status"];
    const tableRows: any[][] = [];
  
    parcelsToExport.forEach(parcel => {
      const parcelData = [
        parcel.trackingNumber,
        parcel.customerName,
        parcel.customerAddress,
        parseFloat(parcel.parcelValue).toFixed(2),
        parcel.status,
      ];
      tableRows.push(parcelData);
    });
  
    const date = new Date().toLocaleDateString('en-GB');
    doc.setFontSize(18);
    doc.text("Parcel Details", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Report generated on: ${date}`, 14, 29);
    doc.text(`Total Parcels: ${parcelsToExport.length}`, 14, 34);
  
    (doc as any).autoTable({
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      didDrawPage: (data: any) => {
        // Footer
        const str = "Page " + (doc as any).internal.getNumberOfPages();
        doc.setFontSize(10);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });
  
    doc.save(`parcels-export-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const isAllParcelsPage = title === 'All Parcel Details';

  // Pagination logic
  const totalPages = Math.ceil(filteredParcels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedParcels = filteredParcels.slice(startIndex, endIndex);
  
  const isAllOnPageSelected = paginatedParcels.length > 0 && paginatedParcels.every(p => selectedParcelIds.includes(p.id));

  return (
    <div className="p-8">
       {tooltip && (
        <div
            className="fixed z-[100] max-w-xs px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm"
            style={{ 
                top: tooltip.y + 15, 
                left: tooltip.x + 15,
                transform: tooltip.x + 300 > window.innerWidth ? 'translateX(-100%)' : 'translateX(0)'
            }}
        >
            {tooltip.content}
        </div>
       )}
       {/* Printable Area - Hidden by default */}
       <div id="printable-area" className="hidden">
            <h1 className="text-2xl font-bold text-black p-4">Selected Parcel Details</h1>
            <div className="grid grid-cols-1 gap-4">
                {parcelsToPrint.map(p => (
                    <div key={p.id} className="printable-card space-y-2">
                        <p><strong>Tracking #:</strong> {p.trackingNumber}</p>
                        <p><strong>Customer:</strong> {p.customerName}</p>
                        <p><strong>Address:</strong> {p.customerAddress}</p>
                        <p><strong>Mobile:</strong> {p.customerMobile}</p>
                        <p><strong>Value:</strong> LKR {parseFloat(p.parcelValue).toFixed(2)}</p>
                        <p><strong>Status:</strong> {p.status}</p>
                    </div>
                ))}
            </div>
        </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>

      {isAllParcelsPage && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 mb-6 space-y-4">
          <div>
            <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search-filter"
              placeholder="By Tracking #, Name, or Address (3+ chars)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-1">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="All">All</option>
                <option value="Pending to Deliver">Pending to Deliver</option>
                <option value="Delivered">Delivered</option>
                <option value="Payment Received">Payment Received</option>
                <option value="Returned">Returned</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Return Complete">Return Complete</option>
              </select>
            </div>
             <div className="lg:col-span-1">
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="lg:col-span-1">
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Clear Filters
            </button>
            <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ExportIcon className="h-5 w-5" />
                Export CSV
            </button>
            <button
                onClick={handleExportPdf}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <DocumentDownloadIcon className="h-5 w-5" />
                Export PDF
            </button>
          </div>
        </div>
      )}

      {selectedParcelIds.length > 0 && (
        <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
            <p className="font-semibold">{selectedParcelIds.length} parcel(s) selected</p>
            <div className="flex items-center gap-2">
                <select
                    value={bulkActionStatus}
                    onChange={(e) => setBulkActionStatus(e.target.value as ParcelStatus)}
                    className="px-3 py-2 border border-blue-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="Pending to Deliver">Pending to Deliver</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Payment Received">Payment Received</option>
                    <option value="Returned">Returned</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Return Complete">Return Complete</option>
                </select>
                <button
                    onClick={handleApplyBulkAction}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                >
                    Apply
                </button>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <PrintIcon />
                    Print Selected
                </button>
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {paginatedParcels.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      onChange={handleSelectAll}
                      checked={isAllOnPageSelected}
                      aria-label="Select all parcels on this page"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creation Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedParcels.map((parcel) => (
                  <tr key={parcel.id} className={`transition-colors duration-200 ${selectedParcelIds.includes(parcel.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedParcelIds.includes(parcel.id)}
                            onChange={() => handleSelectOne(parcel.id)}
                            aria-label={`Select parcel ${parcel.trackingNumber}`}
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">{parcel.trackingNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{parcel.customerName}</td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate"
                      onMouseEnter={(e) => showTooltip(<>{parcel.customerAddress}</>, e)}
                      onMouseLeave={hideTooltip}
                    >
                      {parcel.customerAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcel.customerMobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {parseFloat(parcel.parcelValue).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(parcel.creationDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(parcel.statusHistory[parcel.statusHistory.length - 1].timestamp).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       <div 
                         className="flex items-center gap-1 cursor-pointer"
                         onMouseEnter={(e) => showTooltip(<StatusHistoryTooltip history={parcel.statusHistory} />, e)}
                         onMouseLeave={hideTooltip}
                       >
                         <StatusBadge status={parcel.status} />
                         <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                         <select
                          onChange={(e) => onUpdateStatus(parcel.id, e.target.value as ParcelStatus)}
                          value=""
                          className="text-xs rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          aria-label={`Change status for parcel ${parcel.trackingNumber}`}
                        >
                          <option value="" disabled>Status...</option>
                          {getActionOptions(parcel.status).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <button onClick={() => handleEditClick(parcel)} className="text-blue-600 hover:text-blue-800" aria-label="Edit parcel"><PencilIcon /></button>
                        <button onClick={() => handleDeleteClick(parcel.id)} className="text-red-600 hover:text-red-800" aria-label="Delete parcel"><TrashIcon /></button>
                        <button onClick={() => handlePrintSingle(parcel)} className="text-gray-600 hover:text-gray-800" aria-label={`Print parcel ${parcel.trackingNumber}`}><PrintIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 px-6">
              <h3 className="text-lg font-medium text-gray-700">No parcels found.</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or add a new parcel.</p>
            </div>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredParcels.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
      {selectedParcel && (
        <EditParcelModal 
            parcel={selectedParcel}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={onEditParcel}
        />
      )}
    </div>
  );
};

export default AllParcels;