import React from 'react';
import { ApplicationStatus, ApplicationStatusHistory } from '../types';
import {
  CheckCircle,
  Clock,
  UserCheck,
  Calendar,
  Trophy,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ApplicationTimelineProps {
  currentStatus: ApplicationStatus;
  history?: ApplicationStatusHistory[];
}

const STAGES: Array<{ status: ApplicationStatus; label: string; icon: any }> = [
  { status: 'APPLIED', label: 'Applied', icon: CheckCircle },
  { status: 'UNDER_REVIEW', label: 'Under Review', icon: Clock },
  { status: 'SHORTLISTED', label: 'Shortlisted', icon: UserCheck },
  { status: 'INTERVIEW', label: 'Interview', icon: Calendar },
  { status: 'ACCEPTED', label: 'Offer / Accepted', icon: Trophy },
];

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  currentStatus,
  history = [],
}) => {
  const isRejected = currentStatus === 'REJECTED';
  const isWithdrawn = currentStatus === 'WITHDRAWN';

  const getStageIndex = (status: ApplicationStatus): number => {
    switch (status) {
      case 'APPLIED': return 0;
      case 'UNDER_REVIEW': return 1;
      case 'SHORTLISTED': return 2;
      case 'INTERVIEW': return 3;
      case 'ACCEPTED': return 4;
      case 'REJECTED': return 1;
      case 'WITHDRAWN': return 0;
      default: return 0;
    }
  };

  const currentIdx = getStageIndex(currentStatus);

  return (
    <div className="space-y-6">
      
      {/* Visual Pipeline Bar */}
      {!isRejected && !isWithdrawn ? (
        <div className="relative flex items-center justify-between">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${(currentIdx / (STAGES.length - 1)) * 100}%` }}
          />

          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={stage.status} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`mt-2 text-[11px] font-bold text-center max-w-[70px] ${
                    isCurrent
                      ? 'text-emerald-900'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold text-rose-900 block">
              Application Status: {currentStatus}
            </span>
            <span className="text-rose-700">
              {currentStatus === 'REJECTED'
                ? 'Candidate was not selected for this position at this time.'
                : 'Application was withdrawn by the candidate.'}
            </span>
          </div>
        </div>
      )}

      {/* Audit History Log */}
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Status Audit Timeline
          </h4>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-slate-600 mt-0.5">{item.note}</p>
                  )}
                  {item.changed_by && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Updated by: {item.changed_by}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
