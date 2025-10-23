import React, { useState, useCallback } from 'react';
import { Parcel } from '../types';
import { UploadIcon } from './Icons';

type NewParcelData = Pick<Parcel, 'trackingNumber' | 'customerName' | 'customerAddress' | 'customerMobile' | 'parcelValue'>;

interface ImportParcelsProps {
  onBulkAddParcels: (newParcels: NewParcelData[]) => { added: number, skipped: number };
}

const REQUIRED_HEADERS = ['trackingNumber', 'customerName', 'customerAddress', 'customerMobile', 'parcelValue'];

// Robust CSV line parser that handles quoted fields
const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                currentField += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField.trim());
    return result;
};


const ImportParcels: React.FC<ImportParcelsProps> = ({ onBulkAddParcels }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<NewParcelData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [importResult, setImportResult] = useState<{ added: number, skipped: number } | null>(null);

    const resetState = () => {
        setFile(null);
        setParsedData([]);
        setError(null);
        setImportResult(null);
    };

    const handleFileParse = (fileToParse: File) => {
        resetState();

        if (fileToParse.type !== 'text/csv' && !fileToParse.name.endsWith('.csv')) {
            setError('Invalid file type. Please upload a .csv file.');
            return;
        }
        setFile(fileToParse);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                setError('File is empty or could not be read.');
                return;
            }
            
            try {
                const rows = text.split('\n').filter(row => row.trim() !== '');
                if (rows.length < 2) {
                    setError('CSV file must contain a header row and at least one data row.');
                    return;
                }

                const headers = parseCsvLine(rows[0]).map(h => h.trim());
                const missingHeaders = REQUIRED_HEADERS.filter(rh => !headers.includes(rh));

                if (missingHeaders.length > 0) {
                    setError(`Missing required columns: ${missingHeaders.join(', ')}.`);
                    return;
                }

                const data: NewParcelData[] = [];
                for (let i = 1; i < rows.length; i++) {
                    const values = parseCsvLine(rows[i]);
                    const rowData: any = {};
                    headers.forEach((header, index) => {
                       if(REQUIRED_HEADERS.includes(header)) {
                         rowData[header] = values[index]?.trim() || '';
                       }
                    });

                    if (Object.values(rowData).every(v => v === '')) continue;

                    if (!rowData.trackingNumber || !rowData.customerName) {
                        throw new Error(`Row ${i + 1}: Missing essential data (trackingNumber or customerName).`);
                    }
                    if (isNaN(parseFloat(rowData.parcelValue))) {
                        throw new Error(`Row ${i + 1}: 'parcelValue' must be a valid number.`);
                    }

                    data.push(rowData as NewParcelData);
                }
                setParsedData(data);

            } catch (err: any) {
                setError(err.message || 'An error occurred while parsing the file.');
                setParsedData([]);
            }
        };

        reader.onerror = () => {
            setError('Failed to read the file.');
        };

        reader.readAsText(fileToParse);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileParse(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileParse(e.dataTransfer.files[0]);
        }
    }, []);

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
         e.preventDefault();
         e.stopPropagation();
         if (!isDragging) setIsDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }

    const handleImport = () => {
        if (parsedData.length > 0) {
            const result = onBulkAddParcels(parsedData);
            setImportResult(result);
            setFile(null);
            setParsedData([]);
        }
    };

    const downloadSampleCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + REQUIRED_HEADERS.join(',') + '\n' 
            + 'TRK123,John Smith,"123 Sample Rd, Anytown",0771234567,2500.00';
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sample_parcels.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Import Parcels from File</h1>

            {importResult && (
                 <div className={`border rounded-lg p-4 mb-6 ${importResult.added > 0 ? 'bg-green-100 border-green-300 text-green-800' : 'bg-yellow-100 border-yellow-300 text-yellow-800'}`}>
                    <p className="font-semibold">Import Complete!</p>
                    <p>Successfully imported {importResult.added} new parcels.</p>
                    {importResult.skipped > 0 && (
                        <p>{importResult.skipped} parcels were skipped due to duplicate tracking numbers.</p>
                    )}
                 </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Instructions Card */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Your file must be in <strong className="text-gray-800">.csv</strong> format.</li>
                        <li>The first row must be a header row with the exact column names below.</li>
                        <li>The column order does not matter.</li>
                        <li>To include commas in a field (like an address), enclose the field in double quotes.</li>
                        <li>All imported parcels will be set to 'Pending to Deliver'.</li>
                    </ol>
                    <h3 className="font-semibold text-gray-800 mt-4 mb-2">Required Columns:</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {REQUIRED_HEADERS.map(h => <li key={h}><code className="bg-gray-200 text-sm p-1 rounded">{h}</code></li>)}
                    </ul>
                    <button onClick={downloadSampleCSV} className="mt-6 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-md hover:bg-blue-200 transition-colors text-sm">
                        Download Sample CSV
                    </button>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
                    {!file ? (
                        <div 
                            onDrop={handleDrop}
                            onDragOver={handleDragEvents}
                            onDragEnter={handleDragEvents}
                            onDragLeave={handleDragLeave}
                            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
                                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                            }`}
                        >
                            <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2">Drag & drop your CSV file here</p>
                            <p className="text-gray-500 text-sm mb-4">or</p>
                            <label htmlFor="file-upload" className="cursor-pointer px-5 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors">
                                Browse File
                            </label>
                            <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <div>
                            <h3 className="font-semibold text-gray-800">File: <span className="font-normal text-gray-600">{file.name}</span></h3>
                            {error && 
                                <div className="mt-4 bg-red-100 border border-red-300 text-red-800 rounded-lg p-3 text-sm">
                                    <p className="font-bold">Error parsing file:</p>
                                    <p>{error}</p>
                                </div>
                            }
                        </div>
                    )}
                    
                    {parsedData.length > 0 && !error && (
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-800">Data Preview ({parsedData.length} parcels found)</h3>
                            <div className="overflow-x-auto mt-2 border rounded-lg max-h-60">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            {REQUIRED_HEADERS.map(h => <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {parsedData.slice(0, 5).map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                {REQUIRED_HEADERS.map(h => <td key={h} className="px-4 py-2 whitespace-nowrap truncate max-w-xs">{row[h as keyof NewParcelData]}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {parsedData.length > 5 && <p className="text-xs text-gray-500 mt-1">Showing first 5 rows...</p>}
                            <div className="flex justify-end gap-3 mt-6">
                                 <button onClick={resetState} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
                                    Cancel
                                 </button>
                                 <button onClick={handleImport} className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700">
                                    Import {parsedData.length} Parcels
                                 </button>
                            </div>
                        </div>
                    )}

                    {file && (parsedData.length === 0 || error) && (
                        <div className="flex justify-end mt-6">
                            <button onClick={resetState} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
                                Choose Different File
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ImportParcels;