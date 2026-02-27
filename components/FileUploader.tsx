
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { StudentInfo, SubjectScore, ProcessedResult } from '../types';
import { processResults } from '../utils/calculations';

interface Props {
  onComplete: (results: ProcessedResult[]) => void;
}

const FileUploader: React.FC<Props> = ({ onComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to handle Excel numeric dates
  const formatExcelDate = (val: unknown): string => {
    if (typeof val === 'number') {
      const date = XLSX.SSF.parse_date_code(val);
      const d = String(date.d).padStart(2, '0');
      const m = String(date.m).padStart(2, '0');
      const y = date.y;
      return `${d}-${m}-${y}`;
    }
    return String(val || '');
  };

  const validateAndProcess = (data: Record<string, XLSX.WorkSheet>) => {
    try {
      const studentSheet = data['Student Information'];
      const marksSheet = data['Subjects and Marks'];

      if (!studentSheet || !marksSheet) {
        throw new Error('Required sheets ("Student Information" and "Subjects and Marks") are missing.');
      }

      // Convert sheets to JSON
      const students: StudentInfo[] = XLSX.utils.sheet_to_json(studentSheet).map((row: unknown) => {
        const r = row as Record<string, unknown>;
        return {
          rollNo: String(r['Roll No (Required)'] || r['Roll No'] || ''),
          name: String(r['Student Name'] || ''),
          fatherName: String(r['Father Name'] || ''),
          dob: formatExcelDate(r['Date of Birth (DD-MM-YYYY)'] || r['Date of Birth']),
          class: String(r['Class'] || ''),
          section: String(r['Section'] || '')
        };
      });

      const scores: SubjectScore[] = XLSX.utils.sheet_to_json(marksSheet).map((row: unknown) => {
        const r = row as Record<string, unknown>;
        return {
          rollNo: String(r['Roll No'] || ''),
          subjectName: String(r['Subject Name'] || ''),
          totalMarks: Number(r['Total Marks'] || 0),
          obtainedMarks: Number(r['Obtained Marks'] || 0),
          passingMarks: Number(r['Passing Marks'] || 0)
        };
      });

      // Basic validation
      if (students.length === 0) throw new Error('No student records found.');
      if (scores.length === 0) throw new Error('No subject marks found.');

      const processed = processResults(students, scores);
      onComplete(processed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error processing the file. Please check the template format.');
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const data: Record<string, XLSX.WorkSheet> = {};
      wb.SheetNames.forEach(name => {
        data[name] = wb.Sheets[name];
      });
      
      // Simulate slight delay for smooth UI feel
      setTimeout(() => {
        validateAndProcess(data);
      }, 800);
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsUploading(false);
    };
    reader.readAsBinaryString(file);
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setFileName(null);
    setError(null);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">Upload Student Data</h2>
        <p className="text-slate-500 mt-1">Upload the filled Excel template to generate results.</p>
      </div>

      <div className="p-8">
        {!isUploading && !error && !fileName && (
          <div 
            onClick={triggerInput}
            className="border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="bg-white p-6 rounded-full shadow-sm mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Drop your Excel file here</h3>
            <p className="text-slate-500 mb-8">or click to browse your computer</p>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Supported formats: .xlsx, .xls</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </div>
        )}

        {isUploading && !error && (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Processing Data...</h3>
            <p className="text-slate-500">Parsing sheets and calculating results</p>
          </div>
        )}

        {error && (
          <div className="p-8 border-2 border-red-100 bg-red-50 rounded-3xl flex flex-col items-center text-center">
            <div className="bg-red-100 p-4 rounded-full mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Upload Failed</h3>
            <p className="text-red-800 mb-8 max-w-md">{error}</p>
            <button 
              onClick={reset}
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Try Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
