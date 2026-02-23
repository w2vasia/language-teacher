import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-amber-300 text-amber-700 shadow-sm focus:ring-amber-500 ' +
                className
            }
        />
    );
}
