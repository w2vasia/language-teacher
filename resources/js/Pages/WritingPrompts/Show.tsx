import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnnotatedText from '@/Components/AnnotatedText';
import { Match } from '@/Components/MatchList';
import Card from '@/Components/Card';
import Alert from '@/Components/Alert';
import Badge, { BadgeVariant } from '@/Components/Badge';
import Textarea from '@/Components/Textarea';
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

interface AnalyzeResponse {
    submission: {
        id: number;
        word_count: number;
        writing_prompt_id: number | null;
        score?: number;
    };
    errors: { message: string; category?: { name: string; slug: string } }[];
    matches: Match[];
    translation: string;
}

const categoryBadgeVariant: Record<string, BadgeVariant> = {
    general: 'sky',
    ielts: 'violet',
    toefl: 'indigo',
    business: 'amber',
};

const difficultyBadgeVariant: Record<string, BadgeVariant> = {
    beginner: 'emerald',
    intermediate: 'amber',
    advanced: 'rose',
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
    const [checkedText, setCheckedText] = useState('');
    const [matches, setMatches] = useState<Match[]>([]);
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [wordCount, setWordCount] = useState(0);
    const [translation, setTranslation] = useState<string | null>(null);

    const liveWordCount = clientWordCount(text);

    const quickCheck = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);
        setError(null);
        setScore(null);
        try {
            const { data } = await axios.post('/api/v1/check-text', { text });
            setCheckedText(text);
            setMatches(data.matches);
            setTranslation(data.translation);
            setChecked(true);
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
            setCheckedText(text);
            setMatches(data.matches);
            setTranslation(data.translation);
            setChecked(true);
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

    const showBandEstimate = prompt.category === 'ielts' || prompt.category === 'toefl';

    const handleEdit = () => {
        setChecked(false);
        setSaved(false);
    };

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

                    {/* Prompt card — always visible */}
                    <Card>
                        <h3 className="font-serif text-xl text-amber-950">{prompt.title}</h3>
                        <div className="mt-2 flex gap-2">
                            <Badge variant={categoryBadgeVariant[prompt.category] ?? 'gray'}>
                                {prompt.category}
                            </Badge>
                            <Badge variant={difficultyBadgeVariant[prompt.difficulty] ?? 'gray'}>
                                {prompt.difficulty}
                            </Badge>
                        </div>
                        <p className="mt-4 text-sm text-amber-700/80 leading-relaxed">{prompt.body}</p>
                    </Card>

                    {error && (
                        <Alert variant="error" className="mt-4">
                            {error}
                        </Alert>
                    )}

                    {!checked ? (
                        /* INPUT STATE */
                        <Card className="mt-6">
                            <form onSubmit={quickCheck}>
                                <Textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={10}
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
                        </Card>
                    ) : (
                        /* RESULTS STATE */
                        <div className="mt-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {saved && (
                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                                            Saved
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleEdit}
                                    className="rounded-full border border-amber-300/60 bg-white/80 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm transition-all duration-200 hover:bg-amber-50 hover:shadow"
                                >
                                    Edit text
                                </button>
                            </div>

                            {/* Score banner */}
                            {score !== null && (
                                <div className={`rounded-2xl border p-6 text-center ${scoreColors(score)}`}>
                                    <div className="text-5xl font-bold">{score}</div>
                                    <div className="mt-1 text-sm font-medium">Score</div>
                                    {showBandEstimate && (
                                        <div className="mt-2 text-sm opacity-80">
                                            Estimated: {prompt.category === 'ielts' ? ieltsBand(score) : toeflScore(score)}
                                        </div>
                                    )}
                                </div>
                            )}

                            <AnnotatedText text={checkedText} matches={matches} />

                            {translation && (
                                <Card padding="none">
                                    <div className="p-6">
                                        <h3 className="mb-3 font-serif text-sm font-medium text-amber-800/70">
                                            Translation
                                        </h3>
                                        <p className="whitespace-pre-wrap font-serif leading-relaxed text-amber-950/80">
                                            {translation}
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
