import React, { useState } from 'react';
import { School } from '../../types';
import {
  Building2,
  Search,
  CheckCircle2,
  X,
  MapPin,
  Users,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface SchoolSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  selectedSchoolId: string;
  onSelectSchool: (school: School) => void;
  onOpenRegisterSchool?: () => void;
}

export const SchoolSelectorModal: React.FC<SchoolSelectorModalProps> = ({
  isOpen,
  onClose,
  schools,
  selectedSchoolId,
  onSelectSchool,
  onOpenRegisterSchool,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredSchools = schools.filter((school) => {
    const query = searchQuery.toLowerCase();
    return (
      school.name.toLowerCase().includes(query) ||
      school.code.toLowerCase().includes(query) ||
      (school.address && school.address.toLowerCase().includes(query)) ||
      (school.principalName && school.principalName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Select Your School</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the institution you belong to for role-based authentication.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by school name, code (e.g. EDA, OAK), or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {onOpenRegisterSchool && (
            <button
              onClick={() => {
                onClose();
                onOpenRegisterSchool();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register New</span>
            </button>
          )}
        </div>

        {/* School List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {filteredSchools.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">No schools found matching &ldquo;{searchQuery}&rdquo;</p>
              {onOpenRegisterSchool && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRegisterSchool();
                  }}
                  className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Register this school now →
                </button>
              )}
            </div>
          ) : (
            filteredSchools.map((school) => {
              const isSelected = selectedSchoolId === school.id;
              return (
                <div
                  key={school.id}
                  onClick={() => {
                    onSelectSchool(school);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/40 dark:bg-purple-950/30 ring-1 ring-purple-500/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={school.logo}
                      alt={school.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {school.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.2 rounded">
                          {school.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {school.address || 'Address on file'}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                        <span>Students: {school.stats?.totalStudents || 0}</span>
                        <span>•</span>
                        <span>Principal: {school.principalName || 'Assigned'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Selected
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        school.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}
                    >
                      {school.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
