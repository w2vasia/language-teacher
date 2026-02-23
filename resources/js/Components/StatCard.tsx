import Card from '@/Components/Card';

export default function StatCard({
    label,
    value,
    previousValue,
    invertColor = false,
}: {
    label: string;
    value: string | number;
    previousValue?: number;
    invertColor?: boolean;
}) {
    const current = typeof value === 'number' ? value : parseFloat(value);
    const diff =
        previousValue !== undefined && previousValue > 0
            ? Math.round(((current - previousValue) / previousValue) * 100)
            : null;

    const isPositive = invertColor
        ? diff !== null && diff > 0
        : diff !== null && diff < 0;

    return (
        <Card>
            <dt className="text-sm font-medium text-amber-700/60">{label}</dt>
            <dd className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-3xl text-amber-950">
                    {value}
                </span>
                {diff !== null && diff !== 0 && (
                    <span
                        className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                        {diff > 0 ? '\u2191' : '\u2193'} {Math.abs(diff)}%
                    </span>
                )}
            </dd>
        </Card>
    );
}
