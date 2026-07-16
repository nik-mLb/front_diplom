import { useEffect, useRef } from "react";
import "./styles.scss";

interface SVGImageProps {
    src: string;
    className?: string;
}

function SVGImage({ src, className }: SVGImageProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const res = await fetch(src);
            const text = await res.text();
            if (cancelled || !containerRef.current) return;

            containerRef.current.innerHTML = text;
            const svgElement = containerRef.current
                .firstElementChild as HTMLElement | null;
            if (svgElement && className) {
                svgElement.classList.add(
                    ...className.trim().split(" ").filter(Boolean),
                );
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [src, className]);

    return <div ref={containerRef} />;
}

export default SVGImage;
