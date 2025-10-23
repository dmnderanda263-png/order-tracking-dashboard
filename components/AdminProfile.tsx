import React, { useState } from 'react';
import { AdminData } from '../types';

interface AdminProfileProps {
  adminData: AdminData;
  onUpdatePassword: (oldPassword: string, newPassword: string) => { success: boolean, message: string };
  onResetPassword: () => void;
  onUpdateAdminName: (newName: string) => void;
}

const AdminProfile: React.FC<AdminProfileProps> = ({ adminData, onUpdatePassword, onResetPassword, onUpdateAdminName }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [adminNameInput, setAdminNameInput] = useState(adminData.name);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    const result = onUpdatePassword(oldPassword, newPassword);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }
  };

  const handleResetPassword = () => {
    if (window.confirm('Are you sure you want to reset your password to the default?')) {
      onResetPassword();
      setMessage({ type: 'success', text: 'Password has been reset to the default.' });
    }
  };

  const handleNameUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNameInput.trim()) {
        onUpdateAdminName(adminNameInput);
        setIsEditingName(false);
        setMessage({ type: 'success', text: 'Admin name updated successfully!' });
    } else {
        setMessage({ type: 'error', text: 'Admin name cannot be empty.'});
    }
  };
  
  const handleCancelEditName = () => {
    setAdminNameInput(adminData.name);
    setIsEditingName(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Profile</h1>
      
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 mb-8 max-w-md">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Admin Details</h2>
            {!isEditingName && (
                 <button onClick={() => setIsEditingName(true)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
            )}
        </div>
        <div className="mt-4">
            {isEditingName ? (
                <form onSubmit={handleNameUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="adminName">Admin Name</label>
                        <input type="text" id="adminName" value={adminNameInput} onChange={e => setAdminNameInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={handleCancelEditName} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">Save</button>
                    </div>
                </form>
            ) : (
                <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-md font-medium text-gray-800">{adminData.name}</p>
                </div>
            )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md text-sm mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Password Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="oldPassword">Old Password</label>
                <input type="password" id="oldPassword" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="flex justify-end pt-2">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Update Password</button>
            </div>
          </form>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
           <h2 className="text-lg font-semibold text-gray-900 mb-4">Reset Password</h2>
           <p className="text-sm text-gray-600 mb-4">
             If you have forgotten your password, you can reset it to the system default. The default password is <span className="font-mono bg-gray-200 px-1 py-0.5 rounded">9502</span>.
           </p>
           <div className="flex justify-start">
               <button onClick={handleResetPassword} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset to Default</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;