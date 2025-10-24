import React, { useState } from 'react';
import { Parcel, ParcelStatus } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

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

const PublicTrackingPage: React.FC = () => {
  const [parcels] = useLocalStorage<Parcel[]>('parcels', []);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [foundParcel, setFoundParcel] = useState<Parcel | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const parcel = parcels.find(p => p.trackingNumber.trim().toLowerCase() === trackingNumber.trim().toLowerCase());
    setFoundParcel(parcel || null);
    setSearched(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-4 font-sans antialiased">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-2">
           <svg className="h-10 w-auto text-blue-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 13l-10-5 10-5 10 5-10 5z"/>
           </svg>
          <span className="text-3xl font-bold text-gray-800 tracking-tight">Nethu Fashion</span>
        </div>
        <p className="text-gray-600">Track Your Order Status</p>
      </header>
      
      <main className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.trim())}
              placeholder="Enter your tracking number here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 text-base whitespace-nowrap"
            >
              Track Parcel
            </button>
          </form>
        </div>

        {searched && (
          <div className="mt-8">
            {foundParcel ? (
              <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
                <div className="border-b pb-4 mb-6">
                    <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                    <StatusBadge status={foundParcel.status} />
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery History</h2>
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
              <div className="text-center py-10 px-6 bg-white rounded-xl shadow-md animate-fade-in">
                <h3 className="text-lg font-medium text-gray-700">Parcel Not Found</h3>
                <p className="mt-1 text-sm text-gray-500">The tracking number you entered does not match any parcels. Please check the number and try again.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center mt-12 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Nethu Fashion. All Rights Reserved.</p>
      </footer>
       <style>{`
        @keyframes fade-in {
            0% {
                opacity: 0;
                transform: translateY(10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PublicTrackingPage;
