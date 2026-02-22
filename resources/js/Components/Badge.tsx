const VARIANT_CLASSES = {
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    violet: 'bg-violet-100 text-violet-800',
    sky: 'bg-sky-100 text-sky-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    gray: 'bg-gray-100 text-gray-800',
} as const;

export type BadgeVariant = keyof typeof VARIANT_CLASSES;

export default function Badge({
    variant = 'amber',
    className = '',
    children,
}: {
    variant?: BadgeVariant;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <span
            className={
                'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                (VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.gray) +
                (className ? ` ${className}` : '')
            }
        >
            {children}
        </span>
    );
}
