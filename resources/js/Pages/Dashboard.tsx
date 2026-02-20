import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface ErrorTrend {
    date: string;
    error_count: number;
    word_count: number;
    error_rate: number;
}

interface Stats {
    total_submissions: number;
    total_errors: number;
    total_words_checked: number;
    errors_per_submission: number;
    error_trend: ErrorTrend[];
    previous?: {
        total_submissions: number;
        total_errors: number;
        total_words_checked: number;
        errors_per_submission: number;
    };
}

interface WeakArea {
    name: string;
    slug: string;
    count: number;
}

interface Props {
    stats: Stats;
    weakAreas: WeakArea[];
}

function StatCard({ label, value, previousValue, invertColor = false }: {
    label: string;
    value: string | number;
    previousValue?: number;
    invertColor?: boolean;
}) {
    const current = typeof value === 'number' ? value : parseFloat(value);
    const diff = previousValue !== undefined && previousValue > 0
        ? Math.round(((current - previousValue) / previousValue) * 100)
        : null;

    const isPositive = invertColor ? diff !== null && diff > 0 : diff !== null && diff < 0;

    return (
        <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6">
            <dt className="text-sm font-medium text-amber-700/60">{label}</dt>
            <dd className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-3xl text-amber-950">{value}</span>
                {diff !== null && diff !== 0 && (
                    <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {diff > 0 ? '\u2191' : '\u2193'} {Math.abs(diff)}%
                    </span>
                )}
            </dd>
        </div>
    );
}

function MiniBarChart({ data }: { data: ErrorTrend[] }) {
    const max = Math.max(...data.map((d) => d.error_count), 1);

    return (
        <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6">
            <h3 className="mb-4 text-sm font-medium text-amber-700/60">7-Day Error Trend</h3>
            <div className="flex items-end gap-1" style={{ height: 120 }}>
                {data.slice(-7).map((d) => (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                        <div
                            className="w-full rounded-t bg-amber-500 transition-all duration-300"
                            style={{
                                height: `${(d.error_count / max) * 100}%`,
                                minHeight: d.error_count > 0 ? 4 : 0,
                            }}
                        />
                        <span className="text-xs text-amber-600/40">
                            {d.date.slice(5)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard({ stats, weakAreas }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-serif text-xl leading-tight text-amber-950">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Submissions" value={stats.total_submissions} previousValue={stats.previous?.total_submissions} invertColor />
                        <StatCard label="Total Errors" value={stats.total_errors} previousValue={stats.previous?.total_errors} />
                        <StatCard label="Words Checked" value={stats.total_words_checked} previousValue={stats.previous?.total_words_checked} invertColor />
                        <StatCard label="Errors/Submission" value={stats.errors_per_submission} previousValue={stats.previous?.errors_per_submission} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <MiniBarChart data={stats.error_trend} />

                        <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6">
                            <h3 className="mb-4 text-sm font-medium text-amber-700/60">
                                Weak Areas
                            </h3>
                            {weakAreas.length === 0 ? (
                                <p className="text-sm text-amber-600/40">No data yet. Submit some text to get started.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {weakAreas.map((area) => (
                                        <li key={area.slug} className="flex items-center justify-between">
                                            <span className="text-sm font-medium capitalize text-amber-800">
                                                {area.name}
                                            </span>
                                            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                                                {area.count}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
