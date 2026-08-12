import React from 'react';

type BadgeStatus =
    | 'ACTIVE' | 'RESOLVED' | 'COMPLETED'  // Green
    | 'PENDING' | 'UNDER_REVIEW' | 'IN_PROGRESS'  // Yellow/Orange
    | 'EXPIRED' | 'TERMINATED' | 'MISSED' | 'REPORTED'; // Red

interface StatusBadgeProps {
    status: BadgeStatus;
    label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
    const getStyles = (status: BadgeStatus) => {
        switch (status) {
            case 'ACTIVE':
            case 'RESOLVED':
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING':
            case 'UNDER_REVIEW':
            case 'IN_PROGRESS':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'EXPIRED':
            case 'TERMINATED':
            case 'MISSED':
            case 'REPORTED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles(status)}`}>
            {label || status.replace('_', ' ')}
        </span>
    );
};