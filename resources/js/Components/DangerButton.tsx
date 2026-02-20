import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-full border border-transparent bg-rose-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition duration-200 ease-in-out hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 active:bg-rose-700 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
