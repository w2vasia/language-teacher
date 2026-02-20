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
    errorSummary: Record<string, number>;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        </div>
    );
}

function BarChart({ data, label }: { data: { name: string; value: number }[]; label: string }) {
    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-medium text-gray-500">{label}</h3>
            <div className="space-y-2">
                {data.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-right text-sm capitalize text-gray-600">
                            {d.name}
                        </span>
                        <div className="flex-1">
                            <div
                                className="h-6 rounded bg-indigo-500"
                                style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? 4 : 0 }}
                            />
                        </div>
                        <span className="w-8 text-sm text-gray-500">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TrendChart({ data }: { data: ErrorTrend[] }) {
    const max = Math.max(...data.map((d) => d.error_count), 1);

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-medium text-gray-500">7-Day Trend</h3>
            <div className="flex items-end gap-1" style={{ height: 150 }}>
                {data.slice(-7).map((d) => (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                        <div
                            className="w-full rounded-t bg-indigo-500"
                            style={{
                                height: `${(d.error_count / max) * 100}%`,
                                minHeight: d.error_count > 0 ? 4 : 0,
                            }}
                        />
                        <span className="text-xs text-gray-400">{d.date.slice(5)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Analytics({ stats, weakAreas, errorSummary }: Props) {
    const summaryData = Object.entries(errorSummary).map(([name, value]) => ({ name, value }));

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Analytics
                </h2>
            }
        >
            <Head title="Analytics" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Submissions" value={stats.total_submissions} />
                        <StatCard label="Total Errors" value={stats.total_errors} />
                        <StatCard label="Words Checked" value={stats.total_words_checked} />
                        <StatCard label="Errors/Submission" value={stats.errors_per_submission} />
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <BarChart data={summaryData} label="Error Distribution" />
                        <TrendChart data={stats.error_trend} />
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-sm font-medium text-gray-500">Ranked Weak Areas</h3>
                        {weakAreas.length === 0 ? (
                            <p className="text-sm text-gray-400">No data yet.</p>
                        ) : (
                            <ol className="space-y-2">
                                {weakAreas.map((area, i) => (
                                    <li key={area.slug} className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm font-medium capitalize text-gray-700">
                                            {area.name}
                                        </span>
                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                                            {area.count} errors
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
