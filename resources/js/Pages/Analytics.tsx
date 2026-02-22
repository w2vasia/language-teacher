import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import Card from '@/Components/Card';
import StatCard from '@/Components/StatCard';
import TabSelector from '@/Components/TabSelector';

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
    errorSummary: Record<string, number>;
    days: number | null;
}

const BAR_COLORS = [
    'bg-rose-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-sky-500',
    'bg-emerald-500',
    'bg-pink-500',
    'bg-orange-500',
];

const RANGE_OPTIONS = [
    { label: '7d', value: '7' },
    { label: '30d', value: '30' },
    { label: '90d', value: '90' },
    { label: 'All', value: 'all' },
];

function BarChart({
    data,
    label,
}: {
    data: { name: string; value: number }[];
    label: string;
}) {
    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <Card>
            <h3 className="mb-4 text-sm font-medium text-amber-700/60">
                {label}
            </h3>
            <div className="space-y-2.5">
                {data.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-right text-sm capitalize text-amber-800">
                            {d.name}
                        </span>
                        <div className="flex-1">
                            <div
                                className={`h-6 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-500`}
                                style={{
                                    width: `${(d.value / max) * 100}%`,
                                    minWidth: d.value > 0 ? 8 : 0,
                                }}
                            />
                        </div>
                        <span className="w-8 text-sm text-amber-700/50">
                            {d.value}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function labelInterval(count: number): number {
    if (count <= 10) return 1;
    if (count <= 31) return 5;
    return Math.ceil(count / 8);
}

function TrendChart({ data }: { data: ErrorTrend[] }) {
    const max = Math.max(...data.map((d) => d.error_count), 1);
    const step = labelInterval(data.length);

    return (
        <Card>
            <h3 className="mb-4 text-sm font-medium text-amber-700/60">
                Error Count Trend
            </h3>
            <div className="flex items-end gap-px overflow-hidden" style={{ height: 150 }}>
                {data.map((d, i) => (
                    <div
                        key={d.date}
                        className="flex min-w-0 flex-1 flex-col items-center gap-1"
                    >
                        <div
                            className="w-full rounded-t bg-amber-500 transition-all duration-300"
                            style={{
                                height: `${(d.error_count / max) * 100}%`,
                                minHeight: d.error_count > 0 ? 4 : 0,
                            }}
                        />
                        <span className="truncate text-xs text-amber-600/40">
                            {i % step === 0 ? d.date.slice(5) : ''}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function ErrorRateChart({ data }: { data: ErrorTrend[] }) {
    const max = Math.max(...data.map((d) => d.error_rate), 1);
    const step = labelInterval(data.length);

    return (
        <Card>
            <h3 className="mb-4 text-sm font-medium text-amber-700/60">
                Errors per 100 Words
            </h3>
            <div className="flex items-end gap-px overflow-hidden" style={{ height: 150 }}>
                {data.map((d, i) => (
                    <div
                        key={d.date}
                        className="flex min-w-0 flex-1 flex-col items-center gap-1"
                    >
                        <div
                            className="w-full rounded-t bg-violet-400 transition-all duration-300"
                            style={{
                                height: `${(d.error_rate / max) * 100}%`,
                                minHeight: d.error_rate > 0 ? 4 : 0,
                            }}
                        />
                        <span className="truncate text-xs text-amber-600/40">
                            {i % step === 0 ? d.date.slice(5) : ''}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export default function Analytics({
    stats,
    weakAreas,
    errorSummary,
    days,
}: Props) {
    const summaryData = Object.entries(errorSummary).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl leading-tight text-amber-950">
                        Analytics
                    </h2>
                    <TabSelector
                        options={RANGE_OPTIONS}
                        value={String(days ?? 'all')}
                        onChange={(val) =>
                            router.get(
                                '/analytics',
                                { days: val },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                    />
                </div>
            }
        >
            <Head title="Analytics" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Submissions"
                            value={stats.total_submissions}
                            previousValue={
                                stats.previous?.total_submissions
                            }
                            invertColor
                        />
                        <StatCard
                            label="Total Errors"
                            value={stats.total_errors}
                            previousValue={stats.previous?.total_errors}
                        />
                        <StatCard
                            label="Words Checked"
                            value={stats.total_words_checked}
                            previousValue={
                                stats.previous?.total_words_checked
                            }
                            invertColor
                        />
                        <StatCard
                            label="Errors/Submission"
                            value={stats.errors_per_submission}
                            previousValue={
                                stats.previous?.errors_per_submission
                            }
                        />
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <BarChart
                            data={summaryData}
                            label="Error Distribution"
                        />
                        <TrendChart data={stats.error_trend} />
                    </div>

                    <div className="mb-6">
                        <ErrorRateChart data={stats.error_trend} />
                    </div>

                    <Card>
                        <h3 className="mb-4 text-sm font-medium text-amber-700/60">
                            Ranked Weak Areas
                        </h3>
                        {weakAreas.length === 0 ? (
                            <p className="text-sm text-amber-600/40">
                                No data yet.
                            </p>
                        ) : (
                            <ol className="space-y-2">
                                {weakAreas.map((area, i) => (
                                    <li
                                        key={area.slug}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm font-medium capitalize text-amber-800">
                                            {area.name}
                                        </span>
                                        <Badge variant="rose">
                                            {area.count} errors
                                        </Badge>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
