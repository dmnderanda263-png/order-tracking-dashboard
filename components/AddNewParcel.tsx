import React, { useState, useEffect } from 'react';
import { Parcel } from '../types';

type NewParcelFormData = Pick<Parcel, 'trackingNumber' | 'customerName' | 'customerAddress' | 'customerMobile' | 'parcelValue'>;

interface AddNewParcelProps {
  onAddParcel: (newParcel: NewParcelFormData) => boolean;
}

const initialFormData: NewParcelFormData = {
  trackingNumber: '',
  customerName: '',
  customerAddress: '',
  customerMobile: '',
  parcelValue: '',
};

const AddNewParcel: React.FC<AddNewParcelProps> = ({ onAddParcel }) => {
  const [formData, setFormData] = useState<NewParcelFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<NewParcelFormData>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: Partial<NewParcelFormData> = {};
    if (!formData.trackingNumber.trim()) newErrors.trackingNumber = 'Tracking number is required.';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required.';
    if (!formData.customerAddress.trim()) newErrors.customerAddress = 'Customer address is required.';
    if (!formData.customerMobile.trim()) {
      newErrors.customerMobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(formData.customerMobile.trim())) {
      newErrors.customerMobile = 'Mobile number must be 10 digits.';
    }
    if (!formData.parcelValue.trim()) {
      newErrors.parcelValue = 'Parcel value is required.';
    } else if (parseFloat(formData.parcelValue) <= 0) {
      newErrors.parcelValue = 'Parcel value must be greater than 0.';
    }
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    const success = onAddParcel(formData);

    if (success) {
      setFormData(initialFormData);
    }
  };

  const renderError = (field: keyof NewParcelFormData) => {
    return errors[field] ? <p className="mt-1 text-xs text-red-600">{errors[field]}</p> : null;
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Parcel</h1>
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <input
              type="text"
              name="trackingNumber"
              id="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errors.trackingNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              required
            />
            {renderError('trackingNumber')}
          </div>
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              id="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errors.customerName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              required
            />
            {renderError('customerName')}
          </div>
          <div>
            <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Address
            </label>
            <textarea
              name="customerAddress"
              id="customerAddress"
              rows={3}
              value={formData.customerAddress}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errors.customerAddress ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              required
            ></textarea>
            {renderError('customerAddress')}
          </div>
          <div>
            <label htmlFor="customerMobile" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Mobile
            </label>
            <input
              type="tel"
              name="customerMobile"
              id="customerMobile"
              value={formData.customerMobile}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errors.customerMobile ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              required
            />
            {renderError('customerMobile')}
          </div>
          <div>
            <label htmlFor="parcelValue" className="block text-sm font-medium text-gray-700 mb-1">
              Parcel Value (LKR)
            </label>
            <input
              type="number"
              name="parcelValue"
              id="parcelValue"
              min="0"
              step="0.01"
              value={formData.parcelValue}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${errors.parcelValue ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              required
            />
            {renderError('parcelValue')}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Parcel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewParcel;