import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface ErrorTrend {
    date: string;
    error_count: number;
}

interface Stats {
    total_submissions: number;
    total_errors: number;
    total_words_checked: number;
    errors_per_submission: number;
    error_trend: ErrorTrend[];
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

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6">
            <dt className="text-sm font-medium text-amber-700/60">{label}</dt>
            <dd className="mt-1 font-serif text-3xl text-amber-950">{value}</dd>
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
                        <StatCard label="Submissions" value={stats.total_submissions} />
                        <StatCard label="Total Errors" value={stats.total_errors} />
                        <StatCard label="Words Checked" value={stats.total_words_checked} />
                        <StatCard label="Errors/Submission" value={stats.errors_per_submission} />
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
