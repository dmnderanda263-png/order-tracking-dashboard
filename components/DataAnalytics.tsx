import React, { useState, useMemo } from 'react';
import { Parcel } from '../types';
import Chart, { ChartDataPoint } from './Chart';
import { ChartBarIcon, ChartLineIcon } from './Icons';

type AnalysisType = 'volume' | 'finance';
type Period = 'daily' | 'weekly' | 'monthly';
type ChartType = 'bar' | 'line';

interface DataAnalyticsProps {
  parcels: Parcel[];
  analysisType: AnalysisType;
}

// Helper to get the start of the week (Sunday) for a given date
const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
};

const processData = (parcels: Parcel[], period: Period, type: AnalysisType): ChartDataPoint[] => {
  const sortedParcels = [...parcels].sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());

  const groupedData: { [key: string]: number } = {};

  sortedParcels.forEach(parcel => {
    const date = new Date(parcel.creationDate);
    let key = '';

    if (period === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      key = getStartOfWeek(date).toISOString().split('T')[0];
    } else if (period === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!groupedData[key]) {
      groupedData[key] = 0;
    }

    if (type === 'volume') {
      groupedData[key] += 1;
    } else {
      groupedData[key] += parseFloat(parcel.parcelValue) || 0;
    }
  });
  
  return Object.entries(groupedData).map(([label, value]) => ({ label, value }));
};


const DataAnalytics: React.FC<DataAnalyticsProps> = ({ parcels, analysisType }) => {
  const [period, setPeriod] = useState<Period>('daily');
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  const title = analysisType === 'volume' ? 'Parcel Volume Analysis' : 'Financial Overview';
  const yAxisLabel = analysisType === 'volume' ? 'Number of Parcels' : 'Total Value (LKR)';

  const chartData = useMemo(() => processData(parcels, period, analysisType), [parcels, period, analysisType]);

  const renderFilterButton = (p: Period, label: string) => (
    <button
      onClick={() => setPeriod(p)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        period === p
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-gray-100 border'
      }`}
    >
      {label}
    </button>
  );

  const renderChartTypeButton = (c: ChartType, icon: React.ReactElement) => (
     <button
      onClick={() => setChartType(c)}
      className={`p-2 rounded-md transition-colors ${
        chartType === c
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-100 border'
      }`}
      aria-label={`Switch to ${c} chart`}
    >
      {icon}
    </button>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {renderFilterButton('daily', 'Daily')}
            {renderFilterButton('weekly', 'Weekly')}
            {renderFilterButton('monthly', 'Monthly')}
          </div>
          <div className="flex items-center gap-2">
            {renderChartTypeButton('bar', <ChartBarIcon className="h-5 w-5" />)}
            {renderChartTypeButton('line', <ChartLineIcon className="h-5 w-5" />)}
          </div>
        </div>

        {chartData.length > 0 ? (
           <Chart data={chartData} type={chartType} yAxisLabel={yAxisLabel} />
        ) : (
            <div className="text-center py-20">
                <h3 className="text-lg font-medium text-gray-700">No data available.</h3>
                <p className="mt-1 text-sm text-gray-500">There is no parcel data to display for the selected period.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DataAnalytics;
