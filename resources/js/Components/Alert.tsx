const VARIANT_CLASSES = {
    error: 'bg-rose-50 border-rose-200/60 text-rose-700',
    success: 'bg-emerald-50 border-emerald-200/60 text-emerald-700',
};

export default function Alert({
    variant,
    className = '',
    children,
}: {
    variant: 'error' | 'success';
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={
                'rounded-xl border p-3 text-sm ' +
                VARIANT_CLASSES[variant] +
                (className ? ` ${className}` : '')
            }
        >
            {children}
        </div>
    );
}
