import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import axios from 'axios';

interface Match {
    message: string;
    context?: { text: string; offset: number; length: number };
    offset: number;
    length: number;
    replacements?: { value: string }[];
    rule?: { id: string; description: string; category?: { id: string } };
}

interface AnalyzeResponse {
    submission: { id: number };
    errors: unknown[];
    matches: Match[];
}

export default function TextCheck() {
    const [text, setText] = useState('');
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const quickCheck = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);
        setError(null);
        try {
            const { data } = await axios.post('/api/v1/check-text', { text });
            setMatches(data.matches);
        } catch {
            setError('Failed to check text. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const analyzeAndSave = async () => {
        setLoading(true);
        setSaved(false);
        setError(null);
        try {
            const { data } = await axios.post<AnalyzeResponse>('/api/v1/text/analyze', { text });
            setMatches(data.matches);
            setSaved(true);
        } catch {
            setError('Failed to analyze text. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Text Check
                </h2>
            }
        >
            <Head title="Text Check" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={quickCheck}>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={8}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Paste or type your text here..."
                                />
                                <div className="mt-4 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || !text.trim()}
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Checking...' : 'Quick Check'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={analyzeAndSave}
                                        disabled={loading || !text.trim()}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Analyzing...' : 'Analyze & Save'}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {saved && (
                                <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                                    Analysis saved to your history.
                                </div>
                            )}
                        </div>
                    </div>

                    {matches.length > 0 && (
                        <div className="mt-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">
                                    Found {matches.length} issue{matches.length !== 1 ? 's' : ''}
                                </h3>
                                <ul className="space-y-4">
                                    {matches.map((match, i) => (
                                        <li key={i} className="rounded-md border border-red-200 bg-red-50 p-4">
                                            <p className="text-sm font-medium text-red-800">
                                                {match.message}
                                            </p>
                                            {match.rule && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Rule: {match.rule.id} — {match.rule.description}
                                                </p>
                                            )}
                                            {match.replacements && match.replacements.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    <span className="text-xs text-gray-500">Suggestions:</span>
                                                    {match.replacements.slice(0, 5).map((r, j) => (
                                                        <span
                                                            key={j}
                                                            className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800"
                                                        >
                                                            {r.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
