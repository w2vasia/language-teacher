import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import Card from '@/Components/Card';
import TabSelector from '@/Components/TabSelector';
import { Head, Link, router } from '@inertiajs/react';

interface ErrorItem {
    id: number;
    message: string;
    context: string | null;
    rule_id: string | null;
    replacement_suggestions: string[];
    error_category: { name: string; slug: string } | null;
}

interface Submission {
    id: number;
    original_text: string;
    word_count: number;
    created_at: string;
    errors: ErrorItem[];
}

interface PracticeSessionItem {
    id: number;
    difficulty: string;
    total_exercises: number;
    created_at: string;
    error_category: { name: string; slug: string };
    errors: ErrorItem[];
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    submissions: PaginatedData<Submission> | null;
    practiceSessions: PaginatedData<PracticeSessionItem> | null;
    showAll: boolean;
    source: string;
}

const SOURCE_OPTIONS = [
    { label: 'Text Check', value: 'text-check' },
    { label: 'Practice', value: 'practice' },
];

function Pagination({ data }: { data: PaginatedData<unknown> }) {
    return (
        <div className="flex justify-between">
            {data.prev_page_url ? (
                <Link
                    href={data.prev_page_url}
                    className="rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition-all duration-200 hover:bg-amber-50 hover:shadow-md"
                >
                    Previous
                </Link>
            ) : <div />}
            <span className="self-center text-sm text-amber-700/50">
                Page {data.current_page} of {data.last_page}
            </span>
            {data.next_page_url ? (
                <Link
                    href={data.next_page_url}
                    className="rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition-all duration-200 hover:bg-amber-50 hover:shadow-md"
                >
                    Next
                </Link>
            ) : <div />}
        </div>
    );
}

function ErrorList({ errors }: { errors: ErrorItem[] }) {
    return (
        <div className="divide-y divide-amber-100/60 px-4">
            {errors.map((err) => (
                <div key={err.id} className="py-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-amber-900">{err.message}</p>
                            {err.context && (
                                <p className="mt-0.5 text-xs italic text-amber-700/60">{err.context}</p>
                            )}
                            {err.replacement_suggestions?.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {err.replacement_suggestions.slice(0, 3).map((s, i) => (
                                        <Badge key={i} variant="emerald">
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        {err.error_category && (
                            <Badge variant="amber" className="ml-2 shrink-0 capitalize">
                                {err.error_category.name}
                            </Badge>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ErrorHistory({ submissions, practiceSessions, showAll, source }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-serif text-xl leading-tight text-amber-950">
                    Error History
                </h2>
            }
        >
            <Head title="Error History" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <TabSelector
                            options={SOURCE_OPTIONS}
                            value={source}
                            onChange={(val) => router.get(route('error-history'), { source: val }, { preserveState: true })}
                        />

                        <button
                            onClick={() => router.get(route('error-history'), { source, show_all: showAll ? undefined : '1' }, { preserveState: true })}
                            className="flex items-center gap-2 rounded-full border border-amber-200/60 bg-white/70 px-4 py-2 text-sm font-medium text-amber-800 transition-all duration-200 hover:border-amber-300 hover:text-amber-950"
                        >
                            <span className={`inline-block h-3 w-3 rounded-full transition-colors ${showAll ? 'bg-amber-500' : 'bg-amber-200'}`} />
                            {showAll ? 'Showing all' : 'Only with errors'}
                        </button>
                    </div>

                    {/* Text Check source */}
                    {source === 'text-check' && submissions && (
                        <>
                            {submissions.data.length === 0 ? (
                                <Card className="text-center text-amber-700/60">
                                    No submissions yet. Go to Text Check to analyze some text.
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {submissions.data.map((sub) => (
                                        <Card key={sub.id} padding="none" className="overflow-hidden">
                                            <div className="border-b border-amber-200/30 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-amber-700/50">
                                                            {new Date(sub.created_at).toLocaleDateString()} — {sub.word_count} words
                                                        </p>
                                                        <p className="mt-1 line-clamp-2 text-sm text-amber-800">
                                                            {sub.original_text}
                                                        </p>
                                                    </div>
                                                    <Badge variant={sub.errors.length > 0 ? 'rose' : 'emerald'}>
                                                        {sub.errors.length > 0 ? `${sub.errors.length} error${sub.errors.length !== 1 ? 's' : ''}` : 'All good'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {sub.errors.length > 0 && <ErrorList errors={sub.errors} />}
                                        </Card>
                                    ))}
                                    <Pagination data={submissions} />
                                </div>
                            )}
                        </>
                    )}

                    {/* Practice source */}
                    {source === 'practice' && practiceSessions && (
                        <>
                            {practiceSessions.data.length === 0 ? (
                                <Card className="text-center text-amber-700/60">
                                    No practice sessions yet. Go to Practice to work on exercises.
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {practiceSessions.data.map((session) => (
                                        <Card key={session.id} padding="none" className="overflow-hidden">
                                            <div className="border-b border-amber-200/30 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-amber-700/50">
                                                            {new Date(session.created_at).toLocaleDateString()} — {session.difficulty} — {session.total_exercises} exercises
                                                        </p>
                                                        <p className="mt-1 text-sm font-medium capitalize text-amber-800">
                                                            {session.error_category.name}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="emerald">
                                                            {session.total_exercises - session.errors.length}/{session.total_exercises} correct
                                                        </Badge>
                                                        {session.errors.length > 0 && (
                                                            <Badge variant="rose">
                                                                {session.errors.length} error{session.errors.length !== 1 ? 's' : ''}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {session.errors.length > 0 && <ErrorList errors={session.errors} />}
                                        </Card>
                                    ))}
                                    <Pagination data={practiceSessions} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
