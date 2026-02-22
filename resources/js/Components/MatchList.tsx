import axios from 'axios';
import { useState } from 'react';

export interface Match {
    message: string;
    context?: { text: string; offset: number; length: number };
    offset: number;
    length: number;
    replacements?: { value: string }[];
    rule?: { id: string; description: string; category?: { id: string } };
}

interface Explanation {
    explanation: string;
    incorrect_example: string;
    correct_example: string;
}

export default function MatchList({ matches, checked = false }: { matches: Match[]; checked?: boolean }) {
    const [explanations, setExplanations] = useState<Record<number, Explanation>>({});
    const [loadingExplain, setLoadingExplain] = useState<Set<number>>(new Set());
    const [explainErrors, setExplainErrors] = useState<Set<number>>(new Set());

    if (matches.length === 0) {
        if (!checked) return null;
        return (
            <div className="rounded-2xl border border-emerald-200/40 bg-emerald-50/60 backdrop-blur-sm p-6 text-center">
                <p className="font-serif text-lg text-emerald-800">All good</p>
                <p className="mt-1 text-sm text-emerald-700/60">No errors found in your text.</p>
            </div>
        );
    }

    const handleExplain = async (index: number, match: Match) => {
        setLoadingExplain((prev) => new Set(prev).add(index));
        setExplainErrors((prev) => { const n = new Set(prev); n.delete(index); return n; });

        try {
            const { data } = await axios.post<Explanation>('/api/v1/errors/explain', {
                message: match.message,
                context: match.context?.text ?? '',
                category: match.rule?.category?.id ?? 'other',
                rule_id: match.rule?.id,
                replacement: match.replacements?.[0]?.value,
            });

            setExplanations((prev) => ({ ...prev, [index]: data }));
        } catch {
            setExplainErrors((prev) => new Set(prev).add(index));
        } finally {
            setLoadingExplain((prev) => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
        }
    };

    return (
        <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm">
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
                            {match.context && (
                                <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 font-mono text-sm text-amber-900/70">
                                    {match.context.offset > 0 && <span className="text-amber-700/40">&hellip;</span>}
                                    {match.context.text.slice(0, match.context.offset)}
                                    <span className="font-bold text-rose-700 underline decoration-rose-400 decoration-2 underline-offset-2">
                                        {match.context.text.slice(match.context.offset, match.context.offset + match.context.length)}
                                    </span>
                                    {match.context.text.slice(match.context.offset + match.context.length)}
                                    {match.context.offset + match.context.length < match.context.text.length && <span className="text-amber-700/40">&hellip;</span>}
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

                            {/* Explain button / loading / result */}
                            {!explanations[i] && !loadingExplain.has(i) && (
                                <button
                                    onClick={() => handleExplain(i, match)}
                                    className="mt-3 text-xs font-medium text-amber-700 underline decoration-amber-300 underline-offset-2 transition hover:text-amber-900"
                                >
                                    Explain this error
                                </button>
                            )}

                            {loadingExplain.has(i) && (
                                <div className="mt-3 space-y-2">
                                    <div className="h-3 w-3/4 animate-pulse rounded bg-amber-200/60" />
                                    <div className="h-3 w-1/2 animate-pulse rounded bg-amber-200/60" />
                                    <div className="h-3 w-2/3 animate-pulse rounded bg-amber-200/60" />
                                </div>
                            )}

                            {explainErrors.has(i) && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs text-rose-600">Failed to load explanation.</span>
                                    <button
                                        onClick={() => handleExplain(i, match)}
                                        className="text-xs font-medium text-amber-700 underline decoration-amber-300 underline-offset-2 hover:text-amber-900"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {explanations[i] && (
                                <div className="mt-3 space-y-2 rounded-lg border border-amber-200/40 bg-white/70 p-3">
                                    <p className="text-sm text-amber-900">
                                        {explanations[i].explanation}
                                    </p>
                                    <div className="rounded-md bg-rose-50 px-3 py-1.5">
                                        <span className="text-xs font-medium text-rose-600">Incorrect: </span>
                                        <span className="text-sm text-rose-800">{explanations[i].incorrect_example}</span>
                                    </div>
                                    <div className="rounded-md bg-emerald-50 px-3 py-1.5">
                                        <span className="text-xs font-medium text-emerald-600">Correct: </span>
                                        <span className="text-sm text-emerald-800">{explanations[i].correct_example}</span>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
