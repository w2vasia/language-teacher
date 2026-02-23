import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-amber-500 bg-amber-50 text-amber-900 focus:border-amber-700 focus:bg-amber-100 focus:text-amber-900'
                    : 'border-transparent text-amber-700/70 hover:border-amber-200 hover:bg-amber-50/50 hover:text-amber-900 focus:border-amber-200 focus:bg-amber-50/50 focus:text-amber-900'
            } text-base font-medium transition duration-200 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
