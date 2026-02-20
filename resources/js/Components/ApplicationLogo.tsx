import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <span className="font-serif text-xl text-amber-950 tracking-tight select-none">
            Language<span className="italic text-amber-700">Teacher</span>
        </span>
    );
}
