
import React, { useState } from 'react';
import { 
  School, 
  FileSpreadsheet, 
  Upload, 
  LayoutDashboard
} from 'lucide-react';
import { SchoolConfig, ProcessedResult } from './types';
import SchoolSetup from './components/SchoolSetup';
import TemplateGenerator from './components/TemplateGenerator';
import FileUploader from './components/FileUploader';
import ResultDisplay from './components/ResultDisplay';

type TabType = 'setup' | 'template' | 'upload' | 'results';

interface SidebarItemProps {
  id: TabType;
  activeTab: TabType;
  setActiveTab: (id: TabType) => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ id, activeTab, setActiveTab, icon, label, disabled }) => (
  <button
    onClick={() => !disabled && setActiveTab(id)}
    disabled={disabled}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      activeTab === id 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-600 hover:bg-slate-100'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('setup');
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>({
    name: 'Excellence Public School',
    address: '123 Education Lane, Learning City',
    contact: '+1 234 567 890',
    academicYear: '2023-24',
    examType: 'Final Examination'
  });
  const [results, setResults] = useState<ProcessedResult[]>([]);

  const handleUploadComplete = (processedResults: ProcessedResult[]) => {
    setResults(processedResults);
    setActiveTab('results');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <School className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">EduResult Pro</h1>
        </div>

        <nav className="space-y-2 flex-grow">
          <SidebarItem id="setup" activeTab={activeTab} setActiveTab={setActiveTab} icon={<School className="w-5 h-5" />} label="School Setup" />
          <SidebarItem id="template" activeTab={activeTab} setActiveTab={setActiveTab} icon={<FileSpreadsheet className="w-5 h-5" />} label="Template Generator" />
          <SidebarItem id="upload" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Upload className="w-5 h-5" />} label="Upload Excel" />
          <SidebarItem 
            id="results" 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Results Dashboard" 
            disabled={results.length === 0}
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">School Active</p>
            <p className="text-sm font-bold text-slate-800 truncate">{schoolConfig.name}</p>
            <p className="text-xs text-slate-500 mt-1">{schoolConfig.academicYear}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-grow p-10">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'setup' && (
            <SchoolSetup 
              config={schoolConfig} 
              onSave={(conf) => {
                setSchoolConfig(conf);
                setActiveTab('template');
              }} 
            />
          )}

          {activeTab === 'template' && (
            <TemplateGenerator schoolConfig={schoolConfig} />
          )}

          {activeTab === 'upload' && (
            <FileUploader onComplete={handleUploadComplete} />
          )}

          {activeTab === 'results' && (
            <ResultDisplay 
              results={results} 
              schoolConfig={schoolConfig} 
              onNewUpload={() => setActiveTab('upload')}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
