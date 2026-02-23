import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
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

interface GrammarTopic {
    topic: string;
    error_count: number;
    trend: 'better' | 'worse' | 'stable' | 'new';
    change: number;
    examples: { context: string; message: string; suggestion: string }[];
    tip: string;
    rules: string[];
}

interface Props {
    stats: Stats;
    weakAreas: WeakArea[];
    topicsToReview: GrammarTopic[];
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

const TREND_CONFIG = {
    worse: { icon: '\u2191', color: 'text-rose-600', bg: 'bg-rose-50' },
    better: { icon: '\u2193', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    stable: { icon: '\u2192', color: 'text-gray-500', bg: 'bg-gray-50' },
    new: { icon: '\u2726', color: 'text-amber-600', bg: 'bg-amber-50' },
} as const;

function TopicCard({ topic }: { topic: GrammarTopic }) {
    const [expanded, setExpanded] = useState(false);
    const trend = TREND_CONFIG[topic.trend];

    return (
        <Card padding="none">
            <button
                type="button"
                className="flex w-full items-center gap-3 p-4 text-left"
                onClick={() => setExpanded(!expanded)}
            >
                <span className="flex-1 text-sm font-medium text-amber-900">
                    {topic.topic}
                </span>
                <Badge variant="rose">{topic.error_count}</Badge>
                {topic.trend !== 'stable' && (
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${trend.bg} ${trend.color}`}
                    >
                        {trend.icon}{' '}
                        {topic.change > 0 ? topic.change : ''}
                    </span>
                )}
                <span
                    className={`text-xs text-amber-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                >
                    &#9662;
                </span>
            </button>

            {expanded && (
                <div className="border-t border-amber-100 px-4 pb-4 pt-3">
                    {topic.examples.length > 0 && (
                        <div className="mb-3 space-y-2">
                            {topic.examples.map((ex, i) => (
                                <div
                                    key={i}
                                    className="rounded-lg bg-amber-50/60 px-3 py-2 text-sm"
                                >
                                    <p className="italic text-amber-700/70">
                                        &ldquo;{ex.context}&rdquo;
                                    </p>
                                    <p className="mt-0.5 text-xs text-amber-600">
                                        {ex.message}
                                        {ex.suggestion && (
                                            <span className="ml-1 font-medium text-emerald-700">
                                                &rarr; {ex.suggestion}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-amber-600/60">
                        {topic.tip}
                    </p>
                </div>
            )}
        </Card>
    );
}

export default function Dashboard({
    stats,
    weakAreas,
    topicsToReview,
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
                        Dashboard
                    </h2>
                    <TabSelector
                        options={RANGE_OPTIONS}
                        value={String(days ?? 'all')}
                        onChange={(val) =>
                            router.get(
                                '/dashboard',
                                { days: val },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                    />
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Submissions"
                            value={stats.total_submissions}
                            previousValue={stats.previous?.total_submissions}
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
                            previousValue={stats.previous?.total_words_checked}
                            invertColor
                        />
                        <StatCard
                            label="Errors/Submission"
                            value={stats.errors_per_submission}
                            previousValue={stats.previous?.errors_per_submission}
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

                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
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
                                            <Badge variant="rose">
                                                {area.count}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        <div>
                            <h3 className="mb-4 text-sm font-medium text-amber-700/60">
                                Grammar Topics to Review
                            </h3>
                            {topicsToReview.length === 0 ? (
                                <Card>
                                    <p className="text-sm text-amber-600/40">
                                        No errors yet &mdash; submit some text to
                                        see which topics to review.
                                    </p>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {topicsToReview.map((topic) => (
                                        <TopicCard
                                            key={topic.topic}
                                            topic={topic}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
