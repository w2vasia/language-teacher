export interface Match {
    message: string;
    context?: { text: string; offset: number; length: number };
    offset: number;
    length: number;
    replacements?: { value: string }[];
    rule?: { id: string; description: string; category?: { id: string } };
}

export default function MatchList({ matches }: { matches: Match[] }) {
    if (matches.length === 0) return null;

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
                                    {match.context.offset > 0 && <span className="text-amber-700/40">…</span>}
                                    {match.context.text.slice(0, match.context.offset)}
                                    <span className="font-bold text-rose-700 underline decoration-rose-400 decoration-2 underline-offset-2">
                                        {match.context.text.slice(match.context.offset, match.context.offset + match.context.length)}
                                    </span>
                                    {match.context.text.slice(match.context.offset + match.context.length)}
                                    {match.context.offset + match.context.length < match.context.text.length && <span className="text-amber-700/40">…</span>}
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
    );
}
