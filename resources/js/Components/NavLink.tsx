import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-200 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-amber-600 text-amber-950 focus:border-amber-700'
                    : 'border-transparent text-amber-700/60 hover:border-amber-300 hover:text-amber-900 focus:border-amber-300 focus:text-amber-900') +
                className
            }
        >
            {children}
        </Link>
    );
}
