import React, { useState } from 'react';
import { FileCheck, Download, Search, FileText, User, Building, ExternalLink } from 'lucide-react';
import { Resident } from '../../types';

interface HostDocumentsProps {
  residents: Resident[];
}

export const HostDocuments: React.FC<HostDocumentsProps> = ({ residents }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const withAadhaar = residents.filter((r) => !!r.aadhaarFile);
  const withoutAadhaar = residents.filter((r) => !r.aadhaarFile);

  const filtered = withAadhaar.filter((r) => {
    return (
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber.includes(searchTerm) ||
      r.mobile.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Resident KYC & Aadhaar Vault
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified resident identity documents stored in secure repository.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
            {withAadhaar.length} Uploaded
          </span>
          <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
            {withoutAadhaar.length} Pending
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search documents by resident name or room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {r.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{r.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      Room {r.roomNumber} • Bed #{r.bedNumber}
                    </p>
                  </div>
                </div>
                <span className="p-1 bg-emerald-100 text-emerald-800 rounded-full">
                  <FileCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="py-3 text-xs space-y-1">
                <p className="text-slate-600">
                  <strong className="text-slate-800">Phone:</strong> {r.mobile}
                </p>
                <p className="text-slate-600 truncate">
                  <strong className="text-slate-800">File:</strong> {r.aadhaarFile?.name || 'Aadhaar Document'}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Uploaded on {r.aadhaarFile?.uploadedAt ? new Date(r.aadhaarFile.uploadedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <a
                href={r.aadhaarFile?.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View / Open</span>
              </a>
              <a
                href={r.aadhaarFile?.url}
                download={r.aadhaarFile?.name || `${r.name}_Aadhaar`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No matching Aadhaar documents found</p>
        </div>
      )}
    </div>
  );
};
