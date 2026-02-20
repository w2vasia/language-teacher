import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Live demo: simulates text being typed, then errors appearing      */
/* ------------------------------------------------------------------ */

const DEMO_TEXT = 'She dont believe that the Earth is round, and she go to school everyday.';

const DEMO_ERRORS = [
    { offset: 4, length: 4, replacement: "doesn't", label: 'Grammar' },
    { offset: 52, length: 2, replacement: 'goes', label: 'Grammar' },
    { offset: 58, length: 8, replacement: 'every day', label: 'Spelling' },
];

function LiveDemo() {
    const [charIndex, setCharIndex] = useState(0);
    const [showErrors, setShowErrors] = useState(false);
    const [activeError, setActiveError] = useState<number | null>(null);

    useEffect(() => {
        if (charIndex < DEMO_TEXT.length) {
            const speed = DEMO_TEXT[charIndex] === ' ' ? 60 : 30 + Math.random() * 40;
            const timer = setTimeout(() => setCharIndex((i) => i + 1), speed);
            return () => clearTimeout(timer);
        }
        const reveal = setTimeout(() => setShowErrors(true), 600);
        return () => clearTimeout(reveal);
    }, [charIndex]);

    const visibleText = DEMO_TEXT.slice(0, charIndex);
    const done = charIndex >= DEMO_TEXT.length;

    const renderText = () => {
        if (!showErrors) {
            return (
                <>
                    <span>{visibleText}</span>
                    {!done && (
                        <span className="ml-0.5 inline-block h-[1.2em] w-[2px] translate-y-[2px] bg-amber-900/70 animate-cursor" />
                    )}
                </>
            );
        }

        const parts: JSX.Element[] = [];
        let cursor = 0;

        DEMO_ERRORS.forEach((err, i) => {
            if (cursor < err.offset) {
                parts.push(<span key={`t${i}`}>{DEMO_TEXT.slice(cursor, err.offset)}</span>);
            }
            parts.push(
                <span
                    key={`e${i}`}
                    className="relative cursor-pointer"
                    onMouseEnter={() => setActiveError(i)}
                    onMouseLeave={() => setActiveError(null)}
                >
                    <span className="relative z-10 text-rose-700 font-medium">
                        {DEMO_TEXT.slice(err.offset, err.offset + err.length)}
                    </span>
                    <span
                        className="absolute bottom-0 left-0 h-[2px] bg-rose-500 animate-underline-error"
                        style={{ animationDelay: `${i * 200}ms` }}
                    />
                    {activeError === i && (
                        <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-xl animate-fade-in z-20">
                            <span className="text-rose-400">{err.label}</span>
                            <span className="mx-1.5 text-gray-500">|</span>
                            <span className="text-emerald-400">{err.replacement}</span>
                        </span>
                    )}
                </span>,
            );
            cursor = err.offset + err.length;
        });

        if (cursor < DEMO_TEXT.length) {
            parts.push(<span key="end">{DEMO_TEXT.slice(cursor)}</span>);
        }

        return parts;
    };

    return (
        <div className="relative">
            <div className="rounded-2xl border border-amber-200/60 bg-white/80 backdrop-blur-sm shadow-[0_8px_40px_rgba(180,140,80,0.08)] p-6 sm:p-8">
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-300" />
                    <div className="h-3 w-3 rounded-full bg-amber-300" />
                    <div className="h-3 w-3 rounded-full bg-emerald-300" />
                    <span className="ml-2 text-xs font-medium tracking-wide text-amber-800/40 uppercase">
                        Live Check
                    </span>
                </div>
                <p className="font-serif text-lg sm:text-xl leading-relaxed text-amber-950/80 min-h-[3.5rem]">
                    {renderText()}
                </p>
            </div>

            {showErrors && (
                <div className="mt-4 flex flex-wrap gap-2 animate-fade-up delay-300">
                    {DEMO_ERRORS.map((err, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/70 px-3 py-1 text-xs shadow-sm animate-slide-in-right"
                            style={{ animationDelay: `${400 + i * 150}ms` }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            <span className="font-medium text-amber-900">{err.label}:</span>
                            <span className="line-through text-amber-700/50">
                                {DEMO_TEXT.slice(err.offset, err.offset + err.length)}
                            </span>
                            <span className="text-emerald-700 font-medium">{err.replacement}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Feature card                                                      */
/* ------------------------------------------------------------------ */

function FeatureCard({
    number,
    title,
    description,
    delay,
}: {
    number: string;
    title: string;
    description: string;
    delay: string;
}) {
    return (
        <div className={`group animate-fade-up ${delay}`}>
            <div className="relative rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-8 transition-all duration-500 hover:border-amber-300/60 hover:bg-white/80 hover:shadow-[0_8px_40px_rgba(180,140,80,0.1)]">
                <span className="font-serif text-5xl italic text-amber-300/60 transition-colors duration-500 group-hover:text-amber-400/80">
                    {number}
                </span>
                <h3 className="mt-4 font-serif text-2xl text-amber-950">
                    {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-amber-800/60">
                    {description}
                </p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function Welcome({
    auth,
}: PageProps) {
    return (
        <>
            <Head title="Language Teacher — Write Better" />

            {/* Warm parchment background with subtle grain */}
            <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-amber-50">
                {/* Grain overlay */}
                <div
                    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Decorative blobs */}
                <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
                <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-orange-200/20 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-rose-200/20 blur-3xl" />

                {/* ---- Nav ---- */}
                <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8 sm:py-8">
                    <span className="font-serif text-2xl text-amber-950 tracking-tight">
                        Language<span className="italic text-amber-700">Teacher</span>
                    </span>
                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-full bg-amber-950 px-5 py-2 text-sm font-medium text-amber-50 transition-all duration-300 hover:bg-amber-800 hover:shadow-lg hover:shadow-amber-900/20"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:text-amber-950"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-full bg-amber-950 px-5 py-2 text-sm font-medium text-amber-50 transition-all duration-300 hover:bg-amber-800 hover:shadow-lg hover:shadow-amber-900/20"
                                >
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* ---- Hero ---- */}
                <section className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8 pt-12 sm:pt-20 pb-20">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                        {/* Left: copy */}
                        <div>
                            <div className="animate-fade-up">
                                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-white/60 px-4 py-1.5 text-xs font-medium tracking-wide text-amber-800 backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Powered by LanguageTool
                                </span>
                            </div>

                            <h1 className="mt-8 animate-fade-up delay-100">
                                <span className="block font-serif text-5xl sm:text-6xl lg:text-7xl text-amber-950 leading-[1.1] tracking-tight">
                                    Write better.
                                </span>
                                <span className="block font-serif text-5xl sm:text-6xl lg:text-7xl italic text-amber-700 leading-[1.1] tracking-tight mt-1">
                                    Learn faster.
                                </span>
                            </h1>

                            <p className="mt-8 max-w-lg text-base sm:text-lg leading-relaxed text-amber-800/70 animate-fade-up delay-200">
                                Submit your writing, get instant error detection, and track your
                                progress over time. Every mistake becomes a lesson.
                            </p>

                            <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up delay-300">
                                {auth.user ? (
                                    <Link
                                        href={route('text-check')}
                                        className="group relative inline-flex items-center gap-2 rounded-full bg-amber-950 px-7 py-3.5 text-sm font-semibold text-amber-50 transition-all duration-300 hover:bg-amber-800 hover:shadow-xl hover:shadow-amber-900/25"
                                    >
                                        Start writing
                                        <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="group relative inline-flex items-center gap-2 rounded-full bg-amber-950 px-7 py-3.5 text-sm font-semibold text-amber-50 transition-all duration-300 hover:bg-amber-800 hover:shadow-xl hover:shadow-amber-900/25"
                                        >
                                            Start for free
                                            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 transition-colors hover:text-amber-950"
                                        >
                                            Already have an account?
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: live demo */}
                        <div className="animate-fade-up delay-400">
                            <LiveDemo />
                        </div>
                    </div>
                </section>

                {/* ---- How it works ---- */}
                <section className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8 py-24">
                    <div className="text-center animate-fade-up">
                        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-600">
                            How it works
                        </span>
                        <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-amber-950">
                            Three steps to better writing
                        </h2>
                    </div>

                    <div className="mt-16 grid gap-6 sm:grid-cols-3">
                        <FeatureCard
                            number="01"
                            title="Write & Submit"
                            description="Paste or type any text into the editor. Articles, emails, essays — anything you want to improve."
                            delay="delay-100"
                        />
                        <FeatureCard
                            number="02"
                            title="Spot Errors"
                            description="Instant grammar, spelling, and style analysis. See exactly what went wrong and how to fix it."
                            delay="delay-300"
                        />
                        <FeatureCard
                            number="03"
                            title="Track Progress"
                            description="Your mistakes are categorized and tracked over time. Watch your weak areas become strengths."
                            delay="delay-500"
                        />
                    </div>
                </section>

                {/* ---- Stats / Social proof ---- */}
                <section className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8 py-16">
                    <div className="rounded-3xl border border-amber-200/40 bg-white/50 backdrop-blur-sm p-12 sm:p-16 animate-fade-up">
                        <div className="grid gap-10 sm:grid-cols-3 text-center">
                            {[
                                { value: '7', label: 'Error categories tracked' },
                                { value: '100%', label: 'Self-hosted & private' },
                                { value: 'Real-time', label: 'Instant feedback' },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div className="font-serif text-4xl sm:text-5xl italic text-amber-800">
                                        {stat.value}
                                    </div>
                                    <div className="mt-2 text-sm text-amber-700/60">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ---- Categories preview ---- */}
                <section className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8 py-24">
                    <div className="grid gap-16 lg:grid-cols-2 items-center">
                        <div className="animate-fade-up">
                            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-600">
                                Deep Analysis
                            </span>
                            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-amber-950 leading-tight">
                                Every error,<br />
                                <span className="italic text-amber-700">categorized & explained</span>
                            </h2>
                            <p className="mt-6 text-sm leading-relaxed text-amber-800/60 max-w-md">
                                Your mistakes aren&apos;t just flagged — they&apos;re sorted into categories
                                so you can see patterns. Focus on what matters most to your growth.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 animate-fade-up delay-200">
                            {[
                                { name: 'Grammar', color: 'bg-rose-500', count: '42%' },
                                { name: 'Spelling', color: 'bg-amber-500', count: '23%' },
                                { name: 'Punctuation', color: 'bg-violet-500', count: '15%' },
                                { name: 'Style', color: 'bg-sky-500', count: '11%' },
                                { name: 'Capitalization', color: 'bg-emerald-500', count: '6%' },
                                { name: 'Typography', color: 'bg-pink-500', count: '3%' },
                            ].map((cat, i) => (
                                <div
                                    key={cat.name}
                                    className="group flex items-center gap-3 rounded-xl border border-amber-200/40 bg-white/60 backdrop-blur-sm px-4 py-3 transition-all duration-300 hover:bg-white/80 hover:shadow-md animate-fade-up"
                                    style={{ animationDelay: `${300 + i * 100}ms` }}
                                >
                                    <span className={`h-2.5 w-2.5 rounded-full ${cat.color} transition-transform duration-300 group-hover:scale-125`} />
                                    <span className="text-sm font-medium text-amber-900">{cat.name}</span>
                                    <span className="ml-auto text-xs text-amber-600/50">{cat.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ---- Final CTA ---- */}
                <section className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8 pt-16 pb-32">
                    <div className="text-center animate-fade-up">
                        <h2 className="font-serif text-4xl sm:text-5xl text-amber-950 leading-tight">
                            Your writing journey<br />
                            <span className="italic text-amber-700">starts here</span>
                        </h2>
                        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-amber-800/60">
                            Every word you write is a chance to improve. Start tracking your
                            progress today.
                        </p>
                        <div className="mt-10">
                            <Link
                                href={auth.user ? route('text-check') : route('register')}
                                className="group inline-flex items-center gap-2 rounded-full bg-amber-950 px-8 py-4 text-sm font-semibold text-amber-50 transition-all duration-300 hover:bg-amber-800 hover:shadow-xl hover:shadow-amber-900/25"
                            >
                                {auth.user ? 'Go to Text Check' : 'Create free account'}
                                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ---- Footer ---- */}
                <footer className="relative z-10 border-t border-amber-200/40 py-8">
                    <div className="mx-auto max-w-6xl px-6 sm:px-8 flex items-center justify-between">
                        <span className="font-serif text-sm text-amber-800/40">
                            Language<span className="italic">Teacher</span>
                        </span>
                        <span className="text-xs text-amber-700/30">
                            Self-hosted &middot; Open source
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
