import { Parcel, ParcelStatus } from './types';

// Helper to get dates relative to today
const getRelativeDate = (dayOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString();
};

export const sampleParcels: Parcel[] = [
  {
    id: 1,
    trackingNumber: 'AWB123456789',
    customerName: 'John Doe',
    customerAddress: '123 Main St, Anytown, USA 12345',
    customerMobile: '555-123-4567',
    parcelValue: '1500.00',
    status: 'Delivered',
    creationDate: getRelativeDate(-5),
    statusHistory: [
      { status: 'Pending to Deliver', timestamp: getRelativeDate(-5) },
      { status: 'Delivered', timestamp: getRelativeDate(-2) },
    ],
  },
  {
    id: 2,
    trackingNumber: 'AWB987654321',
    customerName: 'Jane Smith',
    customerAddress: '456 Oak Ave, Sometown, USA 54321',
    customerMobile: '555-987-6543',
    parcelValue: '250.50',
    status: 'Pending to Deliver',
    creationDate: getRelativeDate(-1),
    statusHistory: [{ status: 'Pending to Deliver', timestamp: getRelativeDate(-1) }],
  },
  {
    id: 3,
    trackingNumber: 'AWB555555555',
    customerName: 'Alice Johnson',
    customerAddress: '789 Pine Ln, Othertown, USA 67890',
    customerMobile: '555-555-5555',
    parcelValue: '7500.00',
    status: 'Pending to Deliver',
    creationDate: getRelativeDate(0),
    statusHistory: [{ status: 'Pending to Deliver', timestamp: getRelativeDate(0) }],
  },
  {
    id: 4,
    trackingNumber: 'AWB111222333',
    customerName: 'Bob Brown',
    customerAddress: '101 Maple Dr, Lastown, USA 10112',
    customerMobile: '555-111-2222',
    parcelValue: '320.00',
    status: 'Returned',
    creationDate: getRelativeDate(-10),
    statusHistory: [
      { status: 'Pending to Deliver', timestamp: getRelativeDate(-10) },
      { status: 'Returned', timestamp: getRelativeDate(-4) },
    ],
  },
  {
    id: 5,
    trackingNumber: 'AWB444333222',
    customerName: 'Charlie Davis',
    customerAddress: '212 Birch Rd, Newville, USA 21231',
    customerMobile: '555-444-3333',
    parcelValue: '999.99',
    status: 'Payment Received',
    creationDate: getRelativeDate(-8),
    statusHistory: [
      { status: 'Pending to Deliver', timestamp: getRelativeDate(-8) },
      { status: 'Delivered', timestamp: getRelativeDate(-7) },
      { status: 'Payment Received', timestamp: getRelativeDate(-6) },
    ],
  },
  {
    id: 6,
    trackingNumber: 'AWB667788990',
    customerName: 'Diana Prince',
    customerAddress: '300 Paradise Island, Themyscira',
    customerMobile: '555-667-7889',
    parcelValue: '543.21',
    status: 'Delivered',
    creationDate: getRelativeDate(-3),
    statusHistory: [
        { status: 'Pending to Deliver', timestamp: getRelativeDate(-3) },
        { status: 'Delivered', timestamp: getRelativeDate(-1) },
    ],
  },
];