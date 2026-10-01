import React from 'react';
import { BookOpen, Search, FolderOpen, Inbox } from 'lucide-react';

const ICONS = {
    search: Search,
    book: BookOpen,
    folder: FolderOpen,
    inbox: Inbox,
};

/**
 * EmptyState — Consistent empty/no-results placeholder.
 * 
 * @param {string} icon - Icon key: "search", "book", "folder", "inbox"
 * @param {string} title - Primary heading
 * @param {string} description - Secondary text
 * @param {string} actionLabel - CTA button label (optional)
 * @param {function} onAction - CTA button click handler (optional)
 * @param {string} className - Additional CSS classes
 */
const EmptyState = ({
    icon = 'inbox',
    title = 'Nothing here yet',
    description = '',
    actionLabel,
    onAction,
    className = '',
}) => {
    const Icon = ICONS[icon] || Inbox;

    return (
        <div className={`text-center py-16 px-6 ${className}`}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center">
                <Icon className="text-text-muted" size={28} />
            </div>
            <h3 className="text-lg font-bold text-text-primary font-display mb-1.5">{title}</h3>
            {description && (
                <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">{description}</p>
            )}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-5 btn-ember px-6 py-2.5 text-sm font-semibold"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
