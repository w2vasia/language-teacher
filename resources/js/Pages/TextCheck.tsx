import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
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
                <h2 className="font-serif text-xl leading-tight text-amber-950">
                    Text Check
                </h2>
            }
        >
            <Head title="Text Check" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm">
                        <div className="p-6">
                            <form onSubmit={quickCheck}>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={8}
                                    className="w-full rounded-xl border-amber-200 bg-white/80 shadow-sm transition-colors focus:border-amber-500 focus:ring-amber-500 font-serif text-amber-950/80 leading-relaxed"
                                    placeholder="Paste or type your text here..."
                                />
                                <div className="mt-4 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || !text.trim()}
                                        className="rounded-full bg-amber-950 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-sm transition-all duration-200 hover:bg-amber-800 hover:shadow-lg hover:shadow-amber-900/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Checking...' : 'Quick Check'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={analyzeAndSave}
                                        disabled={loading || !text.trim()}
                                        className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-700/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Analyzing...' : 'Analyze & Save'}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200/60 p-3 text-sm text-rose-700">
                                    {error}
                                </div>
                            )}

                            {saved && (
                                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200/60 p-3 text-sm text-emerald-700">
                                    Analysis saved to your history.
                                </div>
                            )}
                        </div>
                    </div>

                    {matches.length > 0 && (
                        <div className="mt-6 rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm">
                            <div className="p-6">
                                <h3 className="mb-4 font-serif text-lg text-amber-950">
                                    Found {matches.length} issue{matches.length !== 1 ? 's' : ''}
                                </h3>
                                <ul className="space-y-4">
                                    {matches.map((match, i) => (
                                        <li key={i} className="rounded-xl border border-rose-200/60 bg-rose-50/50 p-4">
                                            <p className="text-sm font-medium text-rose-800">
                                                {match.message}
                                            </p>
                                            {match.rule && (
                                                <p className="mt-1 text-xs text-amber-700/50">
                                                    Rule: {match.rule.id} — {match.rule.description}
                                                </p>
                                            )}
                                            {match.replacements && match.replacements.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    <span className="text-xs text-amber-700/50">Suggestions:</span>
                                                    {match.replacements.slice(0, 5).map((r, j) => (
                                                        <span
                                                            key={j}
                                                            className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
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
