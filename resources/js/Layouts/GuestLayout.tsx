import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-amber-50 via-orange-50/30 to-amber-50 pt-6 sm:justify-center sm:pt-0">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-rose-200/20 blur-3xl" />

            {/* Grain overlay */}
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="relative z-10">
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20" />
                </Link>
            </div>

            <div className="relative z-10 mt-8 w-full overflow-hidden rounded-2xl border border-amber-200/40 bg-white/70 px-8 py-6 shadow-xl shadow-amber-900/5 backdrop-blur-sm sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
