import { HTMLAttributes } from 'react';

export default function Card({
    padding = 'default',
    className = '',
    children,
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    padding?: 'none' | 'default';
}) {
    return (
        <div
            {...props}
            className={
                'rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm' +
                (padding === 'default' ? ' p-6' : '') +
                (className ? ` ${className}` : '')
            }
        >
            {children}
        </div>
    );
}
