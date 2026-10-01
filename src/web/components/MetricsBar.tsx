import React from 'react';
import { Send, Users, Award, TrendingUp, Sparkles } from 'lucide-react';
import { TrackerMetrics } from '../../cloud/sync-types';

interface MetricsBarProps {
  metrics: TrackerMetrics;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Applications */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300 font-medium">
            <span>Total Tracked</span>
            <Send className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
            {metrics.totalApplications}
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Across all pipelines</p>
        </div>

        {/* Applied */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300 font-medium">
            <span>Applied</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {metrics.appliedCount}
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Submitted applications</p>
        </div>

        {/* Interviewing */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300 font-medium">
            <span>Interviewing</span>
            <Users className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {metrics.interviewingCount}
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Active interview rounds</p>
        </div>

        {/* Offers */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300 font-medium">
            <span>Offers</span>
            <Award className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {metrics.offerCount}
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Received job offers</p>
        </div>

        {/* Response Rate */}
        <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 dark:bg-brand-950/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-semibold">
            <span>Response Rate</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400">
            {metrics.responseRatePercent}%
          </div>
          <p className="text-[10px] text-brand-600/70 dark:text-brand-400/70">Interview + offer conversion</p>
        </div>
      </div>

      {/* Top in-demand skills */}
      {metrics.topSkillsInDemand.length > 0 && (
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-surface-850 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-semibold text-xs">Top in-demand skills in your tracked jobs:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {metrics.topSkillsInDemand.map(({ skill, count }) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-surface-750 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1"
              >
                <span>{skill}</span>
                <span className="font-mono text-[9px] text-brand-600 dark:text-brand-400 font-bold">
                  ×{count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
