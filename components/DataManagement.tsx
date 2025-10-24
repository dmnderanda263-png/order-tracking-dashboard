import React, { useState } from 'react';
import { DocumentDownloadIcon, UploadIcon, GithubIcon } from './Icons';
import { AppBackup, Parcel, AdminData } from '../types';

interface DataManagementProps {
    onExport: () => void;
    onImport: (jsonData: string) => void;
    parcels: Parcel[];
    adminData: AdminData;
    githubToken: string;
    setGithubToken: (token: string) => void;
    gistId: string;
    setGistId: (id: string) => void;
    showNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const GIST_FILENAME = 'nethu-fashion-backup.json';

const DataManagement: React.FC<DataManagementProps> = ({ 
    onExport, 
    onImport, 
    parcels, 
    adminData, 
    githubToken, 
    setGithubToken, 
    gistId, 
    setGistId, 
    showNotification 
}) => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isSyncing, setIsSyncing] = useState(false);

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

    const handleSaveToGist = async () => {
        if (!githubToken) {
            showNotification('GitHub Personal Access Token is required.', 'error');
            return;
        }

        setIsSyncing(true);

        const backupData: AppBackup = {
            appName: 'NethuFashionOrderTracker',
            version: 1,
            parcels,
            adminData,
        };

        const gistContent = {
            description: `Nethu Fashion Order Tracker Backup - ${new Date().toISOString()}`,
            files: {
                [GIST_FILENAME]: {
                    content: JSON.stringify(backupData, null, 2),
                },
            },
        };

        const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists';
        const method = gistId ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify(gistContent),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to save data to Gist.');
            }

            if (!gistId && responseData.id) {
                setGistId(responseData.id);
                showNotification('Backup saved to new Gist successfully!', 'success');
            } else {
                showNotification('Backup updated successfully!', 'success');
            }
        } catch (error: any) {
            showNotification(error.message, 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLoadFromGist = async () => {
        if (!githubToken || !gistId) {
            showNotification('GitHub Token and Gist ID are both required to load a backup.', 'error');
            return;
        }

        setIsSyncing(true);

        try {
            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to load data from Gist.');
            }

            const file = responseData.files?.[GIST_FILENAME];
            if (!file || !file.content) {
                throw new Error(`Could not find file named '${GIST_FILENAME}' in the Gist.`);
            }
            
            onImport(file.content);

        } catch (error: any) {
            showNotification(error.message, 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Data Management</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Local Backup Card */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Local Backup</h2>
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

                {/* Local Restore Card */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Local Restore</h2>
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
                
                {/* Gist Sync Card */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <GithubIcon className="h-6 w-6 text-gray-800" />
                        <h2 className="text-lg font-semibold text-gray-900">GitHub Gist Sync</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Securely backup and restore your data using a private GitHub Gist. Create a{' '}
                        <a href="https://github.com/settings/tokens/new?scopes=gist" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Personal Access Token
                        </a> with the <code className="bg-gray-200 text-sm p-1 rounded">gist</code> scope.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="githubToken">GitHub Token</label>
                            <input
                                type="password"
                                id="githubToken"
                                value={githubToken}
                                onChange={e => setGithubToken(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ghp_..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="gistId">Gist ID (Optional for new save)</label>
                            <input
                                type="text"
                                id="gistId"
                                value={gistId}
                                onChange={e => setGistId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Leave blank to create a new Gist"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button
                            onClick={handleSaveToGist}
                            disabled={isSyncing || !githubToken}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSyncing ? 'Saving...' : 'Save to Gist'}
                        </button>
                        <button
                            onClick={handleLoadFromGist}
                            disabled={isSyncing || !githubToken || !gistId}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSyncing ? 'Loading...' : 'Load from Gist'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataManagement;