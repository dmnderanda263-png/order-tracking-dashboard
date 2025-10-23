// FIX: Import React to make its types available in this module.
import type * as React from 'react';

export type ParcelStatus = 'Pending to Deliver' | 'Delivered' | 'Payment Received' | 'Returned' | 'Rescheduled';

export interface Parcel {
  id: number;
  trackingNumber: string;
  customerName: string;
  customerAddress: string;
  customerMobile: string;
  parcelValue: string;
  status: ParcelStatus;
  creationDate: string;
  statusHistory: {
    status: ParcelStatus;
    timestamp: string;
  }[];
}

export interface DashboardCardProps {
  title: string;
  count: number | null;
  icon: React.ReactElement;
  onClick?: () => void;
}

export interface NavItemType {
  id: string;
  icon: React.ReactElement;
  label: string;
  hasSubmenu?: boolean;
  submenu?: NavItemType[];
}

export interface AdminData {
  name: string;
  password: string;
}

export interface NotificationMessage {
    message: string;
    type: 'success' | 'error' | 'warning';
}

export interface AppBackup {
  appName: 'NethuFashionOrderTracker';
  version: number;
  parcels: Parcel[];
  adminData: AdminData;
}