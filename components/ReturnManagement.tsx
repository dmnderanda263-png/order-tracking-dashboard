import React, { useState, useMemo, useEffect } from 'react';
import { Parcel, ParcelStatus } from '../types';
import Pagination from './Pagination';

interface ReturnManagementProps {
  parcels: Parcel[]; // Should be pre-filtered to 'Returned' status
  onBulkUpdateStatus: (parcelIds: number[], newStatus: ParcelStatus) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const ITEMS_PER_PAGE = 10;

const ReturnManagement: React.FC<ReturnManagementProps> = ({ parcels, onBulkUpdateStatus, showNotification }) => {
    const [selectedParcelIds, setSelectedParcelIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Sort parcels by date, newest first
    const sortedParcels = useMemo(() => {
        return [...parcels].sort((a, b) => {
            const dateA = new Date(a.statusHistory.find(h => h.status === 'Returned')?.timestamp || a.creationDate).getTime();
            const dateB = new Date(b.statusHistory.find(h => h.status === 'Returned')?.timestamp || b.creationDate).getTime();
            return dateB - dateA;
        });
    }, [parcels]);
    
    useEffect(() => {
        setCurrentPage(1);
        setSelectedParcelIds([]);
    }, [parcels]);

    // Pagination logic
    const totalPages = Math.ceil(sortedParcels.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedParcels = sortedParcels.slice(startIndex, endIndex);

    const isAllOnPageSelected = paginatedParcels.length > 0 && paginatedParcels.every(p => selectedParcelIds.includes(p.id));

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
            onBulkUpdateStatus(selectedParcelIds, 'Return Complete');
            setSelectedParcelIds([]);
        } else {
            showNotification('No parcels selected.', 'warning');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Return Management</h1>

            {selectedParcelIds.length > 0 && (
                <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
                    <p className="font-semibold">{selectedParcelIds.length} parcel(s) selected</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleApplyBulkAction}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            Mark as Return Complete
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
                                        Customer
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mobile
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Returned On
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcel.customerMobile}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {parseFloat(parcel.parcelValue).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(parcel.statusHistory.find(h => h.status === 'Returned')?.timestamp || parcel.creationDate).toLocaleDateString('en-GB')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12 px-6">
                            <h3 className="text-lg font-medium text-gray-700">No Returned Parcels</h3>
                            <p className="mt-1 text-sm text-gray-500">There are currently no parcels marked as 'Returned'.</p>
                        </div>
                    )}
                </div>
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={sortedParcels.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            </div>
        </div>
    );
};

export default ReturnManagement;
