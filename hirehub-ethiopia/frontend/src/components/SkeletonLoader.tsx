import React from 'react';

export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 rounded-xl" />
          <div className="space-y-2">
            <div className="w-28 h-3 bg-slate-200 rounded" />
            <div className="w-44 h-4 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="w-8 h-8 bg-slate-200 rounded-xl" />
      </div>

      <div className="flex gap-2">
        <div className="w-20 h-4 bg-slate-200 rounded" />
        <div className="w-16 h-4 bg-slate-200 rounded" />
        <div className="w-16 h-4 bg-slate-200 rounded" />
      </div>

      <div className="w-32 h-6 bg-slate-200 rounded-lg" />

      <div className="flex gap-1.5 pt-2">
        <div className="w-14 h-4 bg-slate-200 rounded" />
        <div className="w-14 h-4 bg-slate-200 rounded" />
        <div className="w-14 h-4 bg-slate-200 rounded" />
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="w-16 h-3 bg-slate-200 rounded" />
        <div className="flex gap-2">
          <div className="w-16 h-7 bg-slate-200 rounded-lg" />
          <div className="w-16 h-7 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full" />
        <div className="space-y-1.5">
          <div className="w-32 h-3.5 bg-slate-200 rounded" />
          <div className="w-24 h-3 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="w-24 h-4 bg-slate-200 rounded" />
      <div className="w-20 h-6 bg-slate-200 rounded-full" />
      <div className="w-16 h-7 bg-slate-200 rounded-lg" />
    </div>
  );
};
