
import React, { useState } from 'react';
import { ProcessedResult, SchoolConfig } from '../types';
import { 
  Download, 
  CheckCircle2, 
  XCircle, 
  Search,
  Grid,
  List as ListIcon,
  ExternalLink,
  Printer,
  Loader2
} from 'lucide-react';
import { generateSinglePDF, generateBulkPDF } from '../utils/pdf';

interface Props {
  results: ProcessedResult[];
  schoolConfig: SchoolConfig;
  onNewUpload: () => void;
}

const ResultDisplay: React.FC<Props> = ({ results, schoolConfig, onNewUpload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const filteredResults = results.filter(res => 
    res.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.student.rollNo.includes(searchTerm)
  );

  const handleBulkExport = async () => {
    setIsExporting(true);
    try {
      await generateBulkPDF(results, schoolConfig, false);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkPrint = async () => {
    setIsPrinting(true);
    try {
      await generateBulkPDF(results, schoolConfig, true);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={results.length} icon={<ListIcon className="text-blue-600" />} color="bg-blue-50" />
        <StatCard 
          label="Passed" 
          value={results.filter(r => r.summary.status === 'Pass').length} 
          icon={<CheckCircle2 className="text-green-600" />} 
          color="bg-green-50" 
        />
        <StatCard 
          label="Failed" 
          value={results.filter(r => r.summary.status === 'Fail').length} 
          icon={<XCircle className="text-red-600" />} 
          color="bg-red-50" 
        />
        <StatCard 
          label="Pass Percentage" 
          value={`${((results.filter(r => r.summary.status === 'Pass').length / results.length) * 100).toFixed(1)}%`} 
          icon={<ExternalLink className="text-amber-600" />} 
          color="bg-amber-50" 
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center mr-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={handleBulkPrint}
              disabled={isPrinting || isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {isPrinting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
              <span>Print All</span>
            </button>

            <button
              onClick={handleBulkExport}
              disabled={isExporting || isPrinting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              <span>Export PDF</span>
            </button>
            
            <button
              onClick={onNewUpload}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold"
            >
              <span>New Upload</span>
            </button>
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          {viewMode === 'list' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Marks</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((res) => (
                  <tr key={res.student.rollNo} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{res.student.rollNo}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{res.student.name}</div>
                      <div className="text-xs text-slate-500">{res.student.fatherName}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{res.student.class} - {res.student.section}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{res.summary.totalObtainedMarks} / {res.summary.totalMaxMarks}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${res.summary.status === 'Pass' ? 'bg-green-500' : 'bg-red-500'}`} 
                            style={{ width: `${res.summary.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{res.summary.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        res.summary.grade === 'A+' ? 'bg-purple-100 text-purple-700' :
                        res.summary.grade === 'A' ? 'bg-blue-100 text-blue-700' :
                        res.summary.grade === 'Fail' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {res.summary.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {res.summary.status === 'Pass' ? (
                        <span className="inline-flex items-center text-green-600 text-sm font-bold">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600 text-sm font-bold">
                          <XCircle className="w-4 h-4 mr-1" /> Fail
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button 
                          onClick={() => generateSinglePDF(res, schoolConfig, true)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => generateSinglePDF(res, schoolConfig, false)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredResults.map(res => (
                <div key={res.student.rollNo} className="border border-slate-200 rounded-2xl p-6 bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-500">#{res.student.rollNo}</div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      res.summary.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {res.summary.status}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mb-1 leading-tight">{res.student.name}</h4>
                  <p className="text-slate-500 text-xs mb-4">{res.student.fatherName}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Performance</span>
                    <span className="text-sm font-black text-slate-900">{res.summary.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${res.summary.status === 'Pass' ? 'bg-green-500' : 'bg-red-500'}`} 
                      style={{ width: `${res.summary.percentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-3 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Marks</div>
                      <div className="text-sm font-bold text-slate-800">{res.summary.totalObtainedMarks} / {res.summary.totalMaxMarks}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Grade</div>
                      <div className="text-lg font-black text-blue-600">{res.summary.grade}</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => generateSinglePDF(res, schoolConfig, true)}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print</span>
                    </button>
                    <button 
                      onClick={() => generateSinglePDF(res, schoolConfig, false)}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className={`p-6 rounded-3xl border border-white shadow-sm flex items-center space-x-4 ${color}`}>
    <div className="bg-white p-3 rounded-2xl shadow-sm">{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
    </div>
  </div>
);

export default ResultDisplay;
