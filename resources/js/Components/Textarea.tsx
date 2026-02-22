import {
    forwardRef,
    TextareaHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function Textarea(
    {
        className = '',
        isFocused = false,
        ...props
    }: TextareaHTMLAttributes<HTMLTextAreaElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <textarea
            {...props}
            className={
                'w-full rounded-xl border-amber-200 bg-white/80 shadow-sm transition-colors focus:border-amber-500 focus:ring-amber-500 font-serif text-amber-950/80 leading-relaxed ' +
                className
            }
            ref={localRef}
        />
    );
});
