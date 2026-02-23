import Alert from '@/Components/Alert';
import Card from '@/Components/Card';
import Textarea from '@/Components/Textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MatchList, { Match } from '@/Components/MatchList';
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
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card padding="none">
                            <div className="p-6">
                                <form onSubmit={quickCheck}>
                                    <Textarea
                                        value={text}
                                        onChange={(e) => { setText(e.target.value); setChecked(false); }}
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

                        <Card padding="none">
                            <div className="p-6">
                                <h3 className="mb-3 font-serif text-sm font-medium text-amber-800/70">
                                    Translation
                                </h3>
                                {loading ? (
                                    <div className="animate-pulse space-y-2">
                                        <div className="h-4 w-3/4 rounded bg-amber-100"></div>
                                        <div className="h-4 w-1/2 rounded bg-amber-100"></div>
                                        <div className="h-4 w-5/6 rounded bg-amber-100"></div>
                                    </div>
                                ) : translation ? (
                                    <p className="whitespace-pre-wrap font-serif leading-relaxed text-amber-950/80">
                                        {translation}
                                    </p>
                                ) : (
                                    <p className="font-serif text-sm italic text-amber-400">
                                        Translation will appear here after checking...
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {error && (
                        <Alert variant="error" className="mt-4">
                            {error}
                        </Alert>
                    )}

                    {saved && (
                        <Alert variant="success" className="mt-4">
                            Analysis saved to your history.
                        </Alert>
                    )}

                    <div className="mt-6">
                        <MatchList matches={matches} checked={checked} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
