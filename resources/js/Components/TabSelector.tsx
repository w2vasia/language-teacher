interface TabOption {
    label: string;
    value: string;
}

export default function TabSelector({
    options,
    value,
    onChange,
}: {
    options: TabOption[];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex gap-1 rounded-xl bg-amber-100/50 p-1">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        value === opt.value
                            ? 'bg-white text-amber-900 shadow-sm'
                            : 'text-amber-700/60 hover:text-amber-800'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
