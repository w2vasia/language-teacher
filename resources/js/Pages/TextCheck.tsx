import Alert from '@/Components/Alert';
import AnnotatedText from '@/Components/AnnotatedText';
import Card from '@/Components/Card';
import Textarea from '@/Components/Textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Match } from '@/Components/MatchList';
import { Head } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import axios from 'axios';

interface AnalyzeResponse {
    submission: { id: number };
    errors: unknown[];
    matches: Match[];
    translation: string;
}

interface QuickCheckResponse {
    matches: Match[];
    translation: string;
}

export default function TextCheck() {
    const [text, setText] = useState('');
    const [checkedText, setCheckedText] = useState('');
    const [matches, setMatches] = useState<Match[]>([]);
    const [translation, setTranslation] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const quickCheck = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);
        setError(null);
        try {
            const { data } = await axios.post<QuickCheckResponse>('/api/v1/check-text', { text });
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

    const analyzeAndSave = async () => {
        setLoading(true);
        setSaved(false);
        setError(null);
        try {
            const { data } = await axios.post<AnalyzeResponse>('/api/v1/text/analyze', { text });
            setCheckedText(text);
            setMatches(data.matches);
            setTranslation(data.translation);
            setChecked(true);
            setSaved(true);
        } catch {
            setError('Failed to analyze text. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setChecked(false);
        setSaved(false);
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
                    {error && (
                        <Alert variant="error" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {!checked ? (
                        <Card padding="none">
                            <div className="p-6">
                                <form onSubmit={quickCheck}>
                                    <Textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        rows={10}
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
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-6">
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
