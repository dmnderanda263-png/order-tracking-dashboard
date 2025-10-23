import React from 'react';
import DashboardCard from './DashboardCard';
import { DashboardCardProps } from '../types';

interface DashboardProps {
  cardData: DashboardCardProps[];
  setCurrentPage: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cardData, setCurrentPage }) => {
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, index) => {
          let onClickHandler;
          if (card.title === 'All Parcels') {
            onClickHandler = () => setCurrentPage('all-parcels');
          } else if (card.title === 'Pending To Deliver') {
            onClickHandler = () => setCurrentPage('pending-to-deliver');
          } else if (card.title === 'Delivered Parcels') {
            onClickHandler = () => setCurrentPage('delivered-parcels');
          } else if (card.title === 'Return Parcels') {
            onClickHandler = () => setCurrentPage('returned-parcels');
          } else if (card.title === 'Reschedule Parcels') {
            onClickHandler = () => setCurrentPage('rescheduled-parcels');
          } else if (card.title === 'Parcel Tracking') {
            onClickHandler = () => setCurrentPage('parcel-tracking');
          } else if (card.title === 'Bulk Tracking') {
            onClickHandler = () => window.open('https://bepost.lk/p/Search/New_serch_barcode.php', '_blank');
          }

          return (
            <DashboardCard 
              key={index} 
              title={card.title} 
              count={card.count} 
              icon={card.icon}
              onClick={onClickHandler}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;