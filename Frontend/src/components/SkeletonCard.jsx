import React from 'react';

/**
 * SkeletonCard — Shimmer loading placeholder matching card-af layout.
 * 
 * @param {string} variant - "card" (default), "row", "stat"
 * @param {string} className - Additional CSS classes
 */
const SkeletonCard = ({ variant = 'card', className = '' }) => {
    if (variant === 'row') {
        return (
            <div className={`flex items-center gap-4 p-4 rounded-xl bg-surface border border-border-subtle ${className}`}>
                <div className="w-5 h-5 rounded-full skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton-shimmer rounded w-3/4" />
                    <div className="h-3 skeleton-shimmer rounded w-1/2" />
                </div>
                <div className="h-6 w-16 skeleton-shimmer rounded-full" />
            </div>
        );
    }

    if (variant === 'stat') {
        return (
            <div className={`bg-surface rounded-xl border border-border-subtle p-5 ${className}`}>
                <div className="h-3 skeleton-shimmer rounded w-1/3 mb-3" />
                <div className="h-8 skeleton-shimmer rounded w-1/2 mb-2" />
                <div className="h-3 skeleton-shimmer rounded w-2/3" />
            </div>
        );
    }

    // Default: card variant
    return (
        <div className={`card-af ${className}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
                <div className="h-5 w-16 skeleton-shimmer rounded-full" />
            </div>
            <div className="space-y-2.5">
                <div className="h-5 skeleton-shimmer rounded w-3/4" />
                <div className="h-3 skeleton-shimmer rounded w-full" />
                <div className="h-3 skeleton-shimmer rounded w-2/3" />
            </div>
            <div className="mt-5 pt-4 border-t border-border-subtle/60">
                <div className="h-2 skeleton-shimmer rounded-full w-full" />
            </div>
        </div>
    );
};

/**
 * SkeletonTable — Table-specific skeleton with configurable rows.
 */
export const SkeletonTable = ({ rows = 5 }) => (
    <div className="space-y-0">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border-subtle/40">
                <div className="w-5 h-5 rounded-full skeleton-shimmer shrink-0" />
                <div className="flex-1">
                    <div className="h-4 skeleton-shimmer rounded w-2/5" />
                </div>
                <div className="h-5 w-14 skeleton-shimmer rounded-full" />
                <div className="flex gap-1.5">
                    <div className="h-5 w-12 skeleton-shimmer rounded" />
                    <div className="h-5 w-12 skeleton-shimmer rounded" />
                </div>
                <div className="h-7 w-16 skeleton-shimmer rounded-lg" />
            </div>
        ))}
    </div>
);

export default SkeletonCard;
