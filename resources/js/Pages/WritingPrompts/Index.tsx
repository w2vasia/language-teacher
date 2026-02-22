import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface WritingPrompt {
    id: number;
    title: string;
    body: string;
    category: string;
    difficulty: string;
}

interface Props {
    promptsByCategory: Record<string, WritingPrompt[]>;
}

const difficultyColors: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-800',
    intermediate: 'bg-amber-100 text-amber-800',
    advanced: 'bg-rose-100 text-rose-800',
};

const tabs = ['All', 'General', 'IELTS', 'TOEFL', 'Business'];

function PromptCard({ prompt }: { prompt: WritingPrompt }) {
    return (
        <Link
            href={`/writing-prompts/${prompt.id}`}
            className="group rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-5 transition-all hover:border-amber-300/60 hover:shadow-md hover:shadow-amber-100/50"
        >
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-base text-amber-950 group-hover:text-amber-800">
                    {prompt.title}
                </h3>
                <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[prompt.difficulty] ?? 'bg-gray-100 text-gray-800'}`}
                >
                    {prompt.difficulty}
                </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-amber-700/60">
                {prompt.body}
            </p>
        </Link>
    );
}

export default function Index({ promptsByCategory }: Props) {
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = Object.keys(promptsByCategory);
    const allPrompts = categories.flatMap((cat) => promptsByCategory[cat]);

    const filteredCategories =
        activeCategory === 'All'
            ? categories
            : categories.filter(
                  (cat) =>
                      cat.toLowerCase() === activeCategory.toLowerCase(),
              );

    const hasPrompts =
        activeCategory === 'All'
            ? allPrompts.length > 0
            : filteredCategories.some(
                  (cat) => promptsByCategory[cat].length > 0,
              );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl leading-tight text-amber-950">
                        Writing Prompts
                    </h2>
                    <div className="flex gap-1 rounded-xl bg-amber-100/50 p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveCategory(tab)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    activeCategory === tab
                                        ? 'bg-white text-amber-900 shadow-sm'
                                        : 'text-amber-700/60 hover:text-amber-800'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            <Head title="Writing Prompts" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {!hasPrompts ? (
                        <div className="rounded-2xl border border-amber-200/40 bg-white/60 backdrop-blur-sm p-6 text-center text-amber-700/60">
                            No prompts available.
                        </div>
                    ) : activeCategory === 'All' ? (
                        <div className="space-y-8">
                            {filteredCategories.map((category) => (
                                <section key={category}>
                                    <h3 className="mb-4 font-serif text-lg capitalize text-amber-900">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {promptsByCategory[category].map(
                                            (prompt) => (
                                                <PromptCard
                                                    key={prompt.id}
                                                    prompt={prompt}
                                                />
                                            ),
                                        )}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredCategories.flatMap((cat) =>
                                promptsByCategory[cat].map((prompt) => (
                                    <PromptCard
                                        key={prompt.id}
                                        prompt={prompt}
                                    />
                                )),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
