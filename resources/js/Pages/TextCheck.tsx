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
}

export default function TextCheck() {
    const [text, setText] = useState('');
    const [matches, setMatches] = useState<Match[]>([]);
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
            const { data } = await axios.post('/api/v1/check-text', { text });
            setMatches(data.matches);
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
                    <Card padding="none">
                        <div className="p-6">
                            <form onSubmit={quickCheck}>
                                <Textarea
                                    value={text}
                                    onChange={(e) => { setText(e.target.value); setChecked(false); }}
                                    rows={8}
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
                                <Alert variant="error" className="mt-4">
                                    {error}
                                </Alert>
                            )}

                            {saved && (
                                <Alert variant="success" className="mt-4">
                                    Analysis saved to your history.
                                </Alert>
                            )}
                        </div>
                    </Card>

                    <div className="mt-6">
                        <MatchList matches={matches} checked={checked} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
