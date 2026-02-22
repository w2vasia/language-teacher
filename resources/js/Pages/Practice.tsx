import Alert from '@/Components/Alert';
import Badge from '@/Components/Badge';
import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

interface WeakCategory {
    name: string;
    slug: string;
    count: number;
}

interface Exercise {
    type: 'fix_the_sentence' | 'multiple_choice' | 'fill_in_the_blank';
    instruction: string;
    sentence?: string;
    options?: string[];
    correct_answer?: string;
    correct_index?: number;
}

interface CheckResult {
    correct: boolean;
    explanation: string;
}

type Stage = 'idle' | 'loading' | 'practicing' | 'checking' | 'result' | 'summary';

export default function Practice({ weakCategories }: { weakCategories: WeakCategory[] }) {
    const [stage, setStage] = useState<Stage>('idle');
    const [selectedCategory, setSelectedCategory] = useState(weakCategories[0]?.slug ?? '');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [lastResult, setLastResult] = useState<CheckResult | null>(null);
    const [score, setScore] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const currentExercise = exercises[currentIndex] ?? null;

    const startPractice = async () => {
        setStage('loading');
        setError(null);
        setScore(0);
        setCurrentIndex(0);

        try {
            const { data } = await axios.get<{ exercises: Exercise[] }>(
                `/api/v1/practice/exercises?category=${selectedCategory}&count=5`
            );
            setExercises(data.exercises);
            setUserAnswer('');
            setSelectedOption(null);
            setStage('practicing');
        } catch {
            setError('Failed to load exercises. Please try again.');
            setStage('idle');
        }
    };

    const submitAnswer = async () => {
        if (!currentExercise) return;

        const answer = currentExercise.type === 'multiple_choice' && selectedOption !== null
            ? currentExercise.options?.[selectedOption] ?? ''
            : userAnswer;

        if (!answer.trim()) return;

        setStage('checking');

        try {
            const { data } = await axios.post<CheckResult>('/api/v1/practice/check', {
                exercise: currentExercise,
                user_answer: answer,
            });
            setLastResult(data);
            if (data.correct) setScore((s) => s + 1);
            setStage('result');
        } catch {
            setError('Failed to check answer. Please try again.');
            setStage('practicing');
        }
    };

    const nextExercise = () => {
        if (currentIndex + 1 >= exercises.length) {
            setStage('summary');
        } else {
            setCurrentIndex((i) => i + 1);
            setUserAnswer('');
            setSelectedOption(null);
            setLastResult(null);
            setStage('practicing');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-serif text-xl leading-tight text-amber-950">
                    Practice
                </h2>
            }
        >
            <Head title="Practice" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {error && (
                        <Alert variant="error" className="mb-6">
                            {error}
                        </Alert>
                    )}

                    {/* IDLE — Category selection */}
                    {stage === 'idle' && (
                        <Card>
                            {weakCategories.length === 0 ? (
                                <div className="text-center">
                                    <p className="font-serif text-lg text-amber-900">No weak areas yet</p>
                                    <p className="mt-1 text-sm text-amber-700/60">
                                        Submit some texts first so we can identify areas to practice.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="mb-4 font-serif text-lg text-amber-950">
                                        Choose a category to practice
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {weakCategories.map((cat) => (
                                            <button
                                                key={cat.slug}
                                                onClick={() => setSelectedCategory(cat.slug)}
                                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                                    selectedCategory === cat.slug
                                                        ? 'bg-amber-950 text-amber-50 shadow-lg shadow-amber-900/20'
                                                        : 'border border-amber-200/60 bg-white/70 text-amber-800 hover:border-amber-300'
                                                }`}
                                            >
                                                {cat.name}
                                                <span className="ml-1.5 text-xs opacity-60">{cat.count}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={startPractice}
                                        disabled={!selectedCategory}
                                        className="mt-6 rounded-full bg-amber-950 px-6 py-2.5 text-sm font-semibold text-amber-50 shadow-sm transition-all duration-200 hover:bg-amber-800 hover:shadow-lg hover:shadow-amber-900/20 disabled:opacity-50"
                                    >
                                        Start Practice
                                    </button>
                                </>
                            )}
                        </Card>
                    )}

                    {/* LOADING — Skeleton */}
                    {stage === 'loading' && (
                        <Card>
                            <div className="space-y-4">
                                <div className="h-5 w-2/3 animate-pulse rounded bg-amber-200/60" />
                                <div className="h-4 w-full animate-pulse rounded bg-amber-200/40" />
                                <div className="h-4 w-3/4 animate-pulse rounded bg-amber-200/40" />
                                <div className="mt-6 h-10 w-1/3 animate-pulse rounded-full bg-amber-200/60" />
                            </div>
                        </Card>
                    )}

                    {/* PRACTICING — Exercise card */}
                    {(stage === 'practicing' || stage === 'checking') && currentExercise && (
                        <Card>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-medium text-amber-700/50">
                                    Exercise {currentIndex + 1} of {exercises.length}
                                </span>
                                <Badge variant="amber">
                                    {currentExercise.type.replace(/_/g, ' ')}
                                </Badge>
                            </div>

                            <p className="mb-4 font-serif text-lg text-amber-950">
                                {currentExercise.instruction}
                            </p>

                            {currentExercise.sentence && (
                                <p className="mb-4 rounded-xl bg-white/80 px-4 py-3 font-mono text-sm text-amber-900/70">
                                    {currentExercise.sentence}
                                </p>
                            )}

                            {/* fix_the_sentence / fill_in_the_blank */}
                            {currentExercise.type !== 'multiple_choice' && (
                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    rows={2}
                                    disabled={stage === 'checking'}
                                    className="w-full rounded-xl border-amber-200 bg-white/80 font-serif text-amber-950/80 shadow-sm transition-colors focus:border-amber-500 focus:ring-amber-500 disabled:opacity-50"
                                    placeholder="Type your answer..."
                                />
                            )}

                            {/* multiple_choice */}
                            {currentExercise.type === 'multiple_choice' && currentExercise.options && (
                                <div className="space-y-2">
                                    {currentExercise.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedOption(i)}
                                            disabled={stage === 'checking'}
                                            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                                                selectedOption === i
                                                    ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-sm'
                                                    : 'border-amber-200/60 bg-white/70 text-amber-800 hover:border-amber-300'
                                            } disabled:opacity-50`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={submitAnswer}
                                disabled={stage === 'checking' || (currentExercise.type === 'multiple_choice' ? selectedOption === null : !userAnswer.trim())}
                                className="mt-4 rounded-full bg-amber-950 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-sm transition-all duration-200 hover:bg-amber-800 hover:shadow-lg hover:shadow-amber-900/20 disabled:opacity-50"
                            >
                                {stage === 'checking' ? 'Checking...' : 'Submit Answer'}
                            </button>
                        </Card>
                    )}

                    {/* RESULT — Feedback */}
                    {stage === 'result' && lastResult && (
                        <Card>
                            <div className={`mb-4 rounded-xl p-4 ${
                                lastResult.correct
                                    ? 'border border-emerald-200/60 bg-emerald-50'
                                    : 'border border-rose-200/60 bg-rose-50'
                            }`}>
                                <p className={`font-serif text-lg font-medium ${
                                    lastResult.correct ? 'text-emerald-800' : 'text-rose-800'
                                }`}>
                                    {lastResult.correct ? 'Correct!' : 'Not quite right'}
                                </p>
                                <p className={`mt-1 text-sm ${
                                    lastResult.correct ? 'text-emerald-700' : 'text-rose-700'
                                }`}>
                                    {lastResult.explanation}
                                </p>
                            </div>
                            <button
                                onClick={nextExercise}
                                className="rounded-full bg-amber-950 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-sm transition-all duration-200 hover:bg-amber-800 hover:shadow-lg hover:shadow-amber-900/20"
                            >
                                {currentIndex + 1 >= exercises.length ? 'See Results' : 'Next Exercise'}
                            </button>
                        </Card>
                    )}

                    {/* SUMMARY */}
                    {stage === 'summary' && (
                        <Card className="text-center">
                            <p className="font-serif text-3xl font-bold text-amber-950">
                                {score}/{exercises.length}
                            </p>
                            <p className="mt-1 text-sm text-amber-700/60">
                                {score === exercises.length
                                    ? 'Perfect score!'
                                    : score >= exercises.length / 2
                                      ? 'Good effort — keep practicing!'
                                      : 'Keep going — practice makes perfect!'}
                            </p>
                            <button
                                onClick={() => {
                                    setStage('idle');
                                    setExercises([]);
                                    setLastResult(null);
                                    setError(null);
                                }}
                                className="mt-6 rounded-full bg-amber-950 px-6 py-2.5 text-sm font-semibold text-amber-50 shadow-sm transition-all duration-200 hover:bg-amber-800 hover:shadow-lg hover:shadow-amber-900/20"
                            >
                                Practice Again
                            </button>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
