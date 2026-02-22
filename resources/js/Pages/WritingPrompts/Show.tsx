import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import axios from 'axios';

interface WritingPrompt {
    id: number;
    title: string;
    body: string;
    category: string;
    difficulty: string;
}

interface Props {
    prompt: WritingPrompt;
}

interface Match {
    message: string;
    context?: { text: string; offset: number; length: number };
    offset: number;
    length: number;
    replacements?: { value: string }[];
    rule?: { id: string; description: string; category?: { id: string } };
}

interface AnalyzeResponse {
    submission: {
        id: number;
        word_count: number;
        writing_prompt_id: number | null;
        score?: number;
    };
    errors: { message: string; category?: { name: string; slug: string } }[];
    matches: Match[];
}

const categoryBadgeColors: Record<string, string> = {
    general: 'bg-sky-100 text-sky-800',
    ielts: 'bg-violet-100 text-violet-800',
    toefl: 'bg-indigo-100 text-indigo-800',
    business: 'bg-amber-100 text-amber-800',
};

const difficultyBadgeColors: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-800',
    intermediate: 'bg-amber-100 text-amber-800',
    advanced: 'bg-rose-100 text-rose-800',
};

function ieltsBand(score: number): string {
    if (score >= 80) return '~Band 8+';
    if (score >= 60) return '~Band 7';
    if (score >= 40) return '~Band 6';
    if (score >= 20) return '~Band 5';
    return '~Band 4';
}

function toeflScore(score: number): string {
    if (score >= 80) return '~28/30';
    if (score >= 60) return '~25/30';
    if (score >= 40) return '~22/30';
    if (score >= 20) return '~20/30';
    return '~15/30';
}

function scoreColors(score: number): string {
    if (score >= 70) return 'bg-emerald-50 border-emerald-200/60 text-emerald-800';
    if (score >= 40) return 'bg-amber-50 border-amber-200/60 text-amber-800';
    return 'bg-rose-50 border-rose-200/60 text-rose-800';
}

function clientWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function Show({ prompt }: Props) {
    const [text, setText] = useState('');
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [wordCount, setWordCount] = useState(0);

    const liveWordCount = clientWordCount(text);

    const quickCheck = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);
        setError(null);
        setScore(null);
        try {
            const { data } = await axios.post('/api/v1/check-text', { text });
            setMatches(data.matches);
        } catch {
            setError('Failed to check text. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitAndScore = async () => {
        setLoading(true);
        setSaved(false);
        setError(null);
        setScore(null);
        try {
            const { data } = await axios.post<AnalyzeResponse>('/api/v1/text/analyze', {
                text,
                writing_prompt_id: prompt.id,
            });
            setMatches(data.matches);
            setSaved(true);
            const wc = data.submission.word_count;
            setWordCount(wc);
            const errorCount = data.matches.length;
            setScore(wc > 0 ? Math.max(0, Math.round(100 - (errorCount / wc * 500))) : 0);
        } catch {
            setError('Failed to analyze text. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const categoryBreakdown = matches.reduce<Record<string, number>>((acc, match) => {
        const cat = match.rule?.category?.id ?? 'other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const showBandEstimate = prompt.category === 'ielts' || prompt.category === 'toefl';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-serif text-xl leading-tight text-amber-950">
                    {prompt.title}
                </h2>
            }
        >
            <Head title={prompt.title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Link
                        href="/writing-prompts"
                        className="mb-4 inline-flex items-center text-sm text-amber-700/60 hover:text-amber-800 transition-colors"
                    >
                        &larr; Back to prompts
                    </Link>

                    {/* Prompt card */}
                    <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6">
                        <h3 className="font-serif text-xl text-amber-950">{prompt.title}</h3>
                        <div className="mt-2 flex gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeColors[prompt.category] ?? 'bg-gray-100 text-gray-800'}`}>
                                {prompt.category}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyBadgeColors[prompt.difficulty] ?? 'bg-gray-100 text-gray-800'}`}>
                                {prompt.difficulty}
                            </span>
                        </div>
                        <p className="mt-4 text-sm text-amber-700/80 leading-relaxed">{prompt.body}</p>
                    </div>

                    {/* Writing section */}
                    <div className="mt-6 rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6">
                        <form onSubmit={quickCheck}>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={10}
                                className="w-full rounded-xl border-amber-200 bg-white/80 shadow-sm transition-colors focus:border-amber-500 focus:ring-amber-500 font-serif text-amber-950/80 leading-relaxed"
                                placeholder="Write your response here..."
                            />
                            <div className="mt-2 text-xs text-amber-700/50">
                                {liveWordCount} {liveWordCount === 1 ? 'word' : 'words'}
                            </div>
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
                                    onClick={submitAndScore}
                                    disabled={loading || !text.trim()}
                                    className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-700/20 disabled:opacity-50"
                                >
                                    {loading ? 'Scoring...' : 'Submit & Score'}
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

                    {/* Score banner */}
                    {score !== null && (
                        <div className={`mt-6 rounded-2xl border p-6 text-center ${scoreColors(score)}`}>
                            <div className="text-5xl font-bold">{score}</div>
                            <div className="mt-1 text-sm font-medium">Score</div>
                            {showBandEstimate && (
                                <div className="mt-2 text-sm opacity-80">
                                    Estimated: {prompt.category === 'ielts' ? ieltsBand(score) : toeflScore(score)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error list */}
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

                    {/* Category breakdown */}
                    {matches.length > 0 && Object.keys(categoryBreakdown).length > 0 && (
                        <div className="mt-6 rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm">
                            <div className="p-6">
                                <h3 className="mb-3 font-serif text-lg text-amber-950">Category Breakdown</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(categoryBreakdown).map(([cat, count]) => (
                                        <span
                                            key={cat}
                                            className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                                        >
                                            {cat}: {count}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
