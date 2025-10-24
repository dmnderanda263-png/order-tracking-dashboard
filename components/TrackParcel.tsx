import React, { useState } from 'react';
import { Parcel, ParcelStatus } from '../types';

interface TrackParcelProps {
  parcels: Parcel[];
}

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
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
};

const TrackParcel: React.FC<TrackParcelProps> = ({ parcels }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [foundParcel, setFoundParcel] = useState<Parcel | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const parcel = parcels.find(p => p.trackingNumber.toLowerCase() === trackingNumber.toLowerCase());
    setFoundParcel(parcel || null);
    setSearched(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Track Parcel (Admin)</h1>
      
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6 text-sm">
        <p><strong className="font-semibold">Customer Tracking:</strong> You can share a public tracking link with your customers. Tell them to visit <a href="/track" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-600">{window.location.origin}/track</a> and enter their tracking number.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 max-w-2xl mb-8">
        <form onSubmit={handleTrack} className="flex items-center gap-4">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
            required
          />
          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 text-lg"
          >
            Track
          </button>
        </form>
      </div>

      {searched && (
        foundParcel ? (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Tracking Number</h3>
                    <p className="text-lg font-semibold text-gray-900">{foundParcel.trackingNumber}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                    <StatusBadge status={foundParcel.status} />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500">Customer Name</h3>
                    <p className="text-lg font-semibold text-gray-900">{foundParcel.customerName}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-gray-500">Customer Address</h3>
                    <p className="text-lg font-semibold text-gray-900">{foundParcel.customerAddress}</p>
                </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-t pt-6">Status History</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" aria-hidden="true"></div>
              <ul className="space-y-8">
                {[...foundParcel.statusHistory].reverse().map((historyItem, index) => (
                  <li key={index} className="relative pl-12">
                     <div className={`absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-full ${
                         index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                     }`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                     </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className={`text-lg font-semibold ${index === 0 ? 'text-blue-700' : 'text-gray-800'}`}>{historyItem.status}</p>
                        <p className="text-sm text-gray-500 mt-1 sm:mt-0">{new Date(historyItem.timestamp).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-white rounded-xl border border-gray-200/80 shadow-sm">
            <h3 className="text-lg font-medium text-gray-700">Parcel Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">The tracking number you entered does not match any parcels in our system. Please check the number and try again.</p>
          </div>
        )
      )}
    </div>
  );
};

export default TrackParcel;