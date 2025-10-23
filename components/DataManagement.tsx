import React, { useState } from 'react';
import { DocumentDownloadIcon, UploadIcon } from './Icons';

interface DataManagementProps {
    onExport: () => void;
    onImport: (jsonData: string) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onExport, onImport }) => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/json') {
                setError('Invalid file type. Please select a .json file.');
                setFileContent(null);
                setFileName('');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setFileContent(event.target?.result as string);
                setFileName(file.name);
                setError('');
            };
            reader.onerror = () => {
                setError('Failed to read the file.');
                setFileContent(null);
                setFileName('');
            }
            reader.readAsText(file);
        }
    };

    const handleRestore = () => {
        if (fileContent) {
            onImport(fileContent);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Data Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Backup Card */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup Data</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Download all your application data into a single JSON file. This includes all parcels, status history, and admin settings. Keep this file in a safe place to prevent data loss.
                    </p>
                    <button
                        onClick={onExport}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <DocumentDownloadIcon className="h-5 w-5" />
                        Export Backup File
                    </button>
                </div>

                {/* Restore Card */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Restore Data</h2>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
                        <p className="text-sm text-red-700">
                            <span className="font-bold">Warning:</span> Restoring from a backup will <span className="font-bold">overwrite all existing data</span>. This action cannot be undone.
                        </p>
                    </div>
                    
                    <div>
                        <label htmlFor="backup-file-upload" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-200 focus:outline-none cursor-pointer transition-colors">
                            <UploadIcon className="h-5 w-5" />
                            {fileName ? `Selected: ${fileName}` : 'Choose Backup File (.json)'}
                        </label>
                        <input
                            id="backup-file-upload"
                            type="file"
                            accept=".json,application/json"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    
                    {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

                    <button
                        onClick={handleRestore}
                        disabled={!fileContent}
                        className="w-full mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Restore From Backup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataManagement;
