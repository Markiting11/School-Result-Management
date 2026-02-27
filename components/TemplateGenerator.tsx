
import React from 'react';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, Info } from 'lucide-react';
import { SchoolConfig } from '../types';

interface Props {
  schoolConfig: SchoolConfig;
}

const TemplateGenerator: React.FC<Props> = ({ schoolConfig }) => {
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Student Information
    const studentData = [
      ['Roll No (Required)', 'Student Name', 'Father Name', 'Date of Birth (DD-MM-YYYY)', 'Class', 'Section', 'School Name'],
      ['1001', 'John Doe', 'Richard Doe', '01-01-2015', 'Grade 5', 'A', schoolConfig.name],
      ['1002', 'Jane Smith', 'William Smith', '15-05-2015', 'Grade 5', 'A', schoolConfig.name],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(studentData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Student Information');

    // Sheet 2: Subjects & Marks
    const marksData = [
      ['Roll No', 'Subject Name', 'Total Marks', 'Obtained Marks', 'Passing Marks'],
      ['1001', 'Mathematics', '100', '85', '40'],
      ['1001', 'English', '100', '72', '40'],
      ['1001', 'Science', '100', '91', '40'],
      ['1002', 'Mathematics', '100', '45', '40'],
      ['1002', 'English', '100', '35', '40'],
      ['1002', 'Science', '100', '52', '40'],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(marksData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Subjects and Marks');

    // Sheet 3: Instructions
    const instructions = [
      ['Instructions for filling the data'],
      ['1. Roll No must be consistent across both sheets.'],
      ['2. Roll No must be unique for each student in Student Information sheet.'],
      ['3. Marks should be numeric only.'],
      ['4. Obtained marks should not exceed Total Marks.'],
      ['5. Passing marks define whether a student passes the subject.'],
      ['6. Do not change the column headers (First Row) of any sheet.'],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, ws3, 'Instructions');

    XLSX.writeFile(wb, `${schoolConfig.name.replace(/\s+/g, '_')}_Result_Template.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">Download Template</h2>
        <p className="text-slate-500 mt-1">Get the standardized Excel file to enter your student data and marks.</p>
      </div>

      <div className="p-8">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start space-x-4 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-blue-900 font-bold mb-1">Standardized Workflow</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              Our system uses a specific Excel structure to ensure accurate calculations. 
              The downloaded file will contain pre-filled headers and sample data for your guidance. 
              Please follow the instructions sheet within the file.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
          <div className="bg-white p-6 rounded-full shadow-sm mb-6">
            <FileSpreadsheet className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to generate template?</h3>
          <p className="text-slate-500 mb-8 max-w-sm text-center">
            Click the button below to download the Excel template configured for <b>{schoolConfig.name}</b>.
          </p>
          
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 px-10 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 scale-100 active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>Download Excel Template</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateGenerator;
