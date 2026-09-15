import React from 'react';
import { LucideIcon, Search, Briefcase } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Briefcase,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/80">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs transition-colors shadow-2xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
