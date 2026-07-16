import { useEffect, useRef } from "react";
import "./styles.scss";

interface InfinityListProps {
    onShow: () => void;
}

function InfinityList({ onShow }: InfinityListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onShowRef = useRef(onShow);
    onShowRef.current = onShow;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onShowRef.current();
                }
            },
            {
                root: null,
                threshold: 0.1,
            },
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    return <div className="infinity-list" ref={containerRef}></div>;
}

export default InfinityList;
