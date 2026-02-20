import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

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

interface PaginatedData {
    data: Submission[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    submissions: PaginatedData;
}

export default function ErrorHistory({ submissions }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Error History
                </h2>
            }
        >
            <Head title="Error History" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {submissions.data.length === 0 ? (
                        <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
                            No submissions yet. Go to Text Check to analyze some text.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submissions.data.map((sub) => (
                                <div key={sub.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
                                    <div className="border-b border-gray-200 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(sub.created_at).toLocaleDateString()} — {sub.word_count} words
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-sm text-gray-700">
                                                    {sub.original_text}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                {sub.errors.length} error{sub.errors.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    {sub.errors.length > 0 && (
                                        <div className="divide-y divide-gray-100 px-4">
                                            {sub.errors.map((err) => (
                                                <div key={err.id} className="py-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-sm text-gray-800">{err.message}</p>
                                                            {err.replacement_suggestions?.length > 0 && (
                                                                <div className="mt-1 flex flex-wrap gap-1">
                                                                    {err.replacement_suggestions.slice(0, 3).map((s, i) => (
                                                                        <span key={i} className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
                                                                            {s}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {err.error_category && (
                                                            <span className="ml-2 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
                                                                {err.error_category.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex justify-between">
                                {submissions.prev_page_url ? (
                                    <Link
                                        href={submissions.prev_page_url}
                                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                ) : <div />}
                                <span className="self-center text-sm text-gray-500">
                                    Page {submissions.current_page} of {submissions.last_page}
                                </span>
                                {submissions.next_page_url ? (
                                    <Link
                                        href={submissions.next_page_url}
                                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                ) : <div />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
