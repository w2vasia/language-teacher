import { useState } from 'react';
import { Match } from './MatchList';

const CATEGORY_STYLES: Record<string, { label: string; dot: string; underline: string; badgeBg: string; badgeText: string }> = {
    GRAMMAR: { label: 'Grammar', dot: 'bg-rose-400', underline: 'decoration-rose-400/70', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700' },
    TYPOS: { label: 'Spelling', dot: 'bg-amber-400', underline: 'decoration-amber-400/70', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
    CASING: { label: 'Capitalization', dot: 'bg-violet-400', underline: 'decoration-violet-400/70', badgeBg: 'bg-violet-100', badgeText: 'text-violet-700' },
    STYLE: { label: 'Style', dot: 'bg-sky-400', underline: 'decoration-sky-400/70', badgeBg: 'bg-sky-100', badgeText: 'text-sky-700' },
    TYPOGRAPHY: { label: 'Typography', dot: 'bg-teal-400', underline: 'decoration-teal-400/70', badgeBg: 'bg-teal-100', badgeText: 'text-teal-700' },
    PUNCTUATION: { label: 'Punctuation', dot: 'bg-orange-400', underline: 'decoration-orange-400/70', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
};

const DEFAULT_STYLE = { label: 'Other', dot: 'bg-gray-400', underline: 'decoration-gray-400/70', badgeBg: 'bg-gray-100', badgeText: 'text-gray-700' };

function getStyle(categoryId?: string) {
    if (categoryId && CATEGORY_STYLES[categoryId]) {
        return CATEGORY_STYLES[categoryId];
    }
    return DEFAULT_STYLE;
}

interface IndexedMatch extends Match {
    originalIndex: number;
}

function buildSegments(text: string, matches: Match[]) {
    const sorted: IndexedMatch[] = [...matches]
        .map((m, i) => ({ ...m, originalIndex: i }))
        .sort((a, b) => a.offset - b.offset)
        .reduce<IndexedMatch[]>((acc, m) => {
            const last = acc[acc.length - 1];
            if (last && m.offset < last.offset + last.length) return acc;
            acc.push(m);
            return acc;
        }, []);

    const segments: Array<{ text: string; match?: IndexedMatch }> = [];
    let cursor = 0;
    for (const match of sorted) {
        if (match.offset > cursor) {
            segments.push({ text: text.slice(cursor, match.offset) });
        }
        segments.push({ text: text.slice(match.offset, match.offset + match.length), match });
        cursor = match.offset + match.length;
    }
    if (cursor < text.length) {
        segments.push({ text: text.slice(cursor) });
    }
    return { segments, sorted };
}

export default function AnnotatedText({ text, matches }: { text: string; matches: Match[] }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const { segments, sorted } = buildSegments(text, matches);

    if (matches.length === 0) {
        return (
            <div className="rounded-2xl border border-emerald-200/40 bg-emerald-50/60 p-6 text-center backdrop-blur-sm">
                <p className="font-serif text-lg text-emerald-800">All good</p>
                <p className="mt-1 text-sm text-emerald-700/60">No errors found in your text.</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm">
            {/* Annotated text */}
            <div className="p-6">
                <p className="font-serif text-lg leading-relaxed text-amber-950/80 whitespace-pre-wrap">
                    {segments.map((seg, i) => {
                        if (!seg.match) return <span key={i}>{seg.text}</span>;

                        const style = getStyle(seg.match.rule?.category?.id);
                        const replacement = seg.match.replacements?.[0]?.value;
                        const isActive = activeIndex === seg.match.originalIndex;

                        return (
                            <span
                                key={i}
                                className="relative inline"
                                onMouseEnter={() => setActiveIndex(seg.match!.originalIndex)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                <span
                                    className={`cursor-pointer underline decoration-2 underline-offset-4 ${style.underline} ${isActive ? 'bg-rose-100/60 rounded' : ''}`}
                                >
                                    {seg.text}
                                </span>
                                {isActive && (
                                    <span className="absolute bottom-full left-1/2 z-10 mb-2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200/60 bg-white px-2.5 py-1 shadow-lg shadow-amber-900/10">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badgeBg} ${style.badgeText}`}>
                                            {style.label}
                                        </span>
                                        {replacement && (
                                            <span className="text-sm font-medium text-amber-900">{replacement}</span>
                                        )}
                                        <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-amber-200/60 bg-white" />
                                    </span>
                                )}
                            </span>
                        );
                    })}
                </p>
            </div>

            {/* Error summary chips */}
            <div className="border-t border-amber-200/30 px-6 py-4">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {sorted.map((match) => {
                        const style = getStyle(match.rule?.category?.id);
                        const errorText = text.slice(match.offset, match.offset + match.length);
                        const replacement = match.replacements?.[0]?.value;
                        const isActive = activeIndex === match.originalIndex;

                        return (
                            <span
                                key={match.originalIndex}
                                className={`flex cursor-default items-center gap-1.5 rounded-full px-2 py-0.5 text-sm transition-colors ${isActive ? 'bg-amber-100/60' : ''}`}
                                onMouseEnter={() => setActiveIndex(match.originalIndex)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                                <span className="font-medium text-amber-800/70">{style.label}:</span>
                                <span className="text-amber-600/60 line-through">{errorText}</span>
                                {replacement && (
                                    <span className="font-medium text-emerald-700">{replacement}</span>
                                )}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
