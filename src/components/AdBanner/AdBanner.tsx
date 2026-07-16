import { useEffect, useRef, useState } from "react";
import "./styles.scss";

interface AdBannerProps {
    url: string;
}

function AdBanner({ url }: AdBannerProps) {
    const [error, setError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const linkRef = useRef<any>(null);
    const errorRef = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        const iframe = iframeRef.current;
        if (!container || !iframe) return;

        const resizeObserver = new ResizeObserver(() => {
            if (errorRef.current) return;
            iframe.style.scale = `${container.clientWidth / 300}`;
            iframe.style.marginBottom = `${container.clientWidth - 300}px`;
        });
        resizeObserver.observe(container);

        const handleLoad = () => {
            if (errorRef.current) return;
            const link =
                iframe.contentWindow?.document
                    .querySelectorAll("a[href]")
                    .item(0) ?? null;
            linkRef.current = link;
            if (link === null) {
                errorRef.current = true;
                setError(true);
            }
        };
        iframe.addEventListener("load", handleLoad);

        const timeout = setTimeout(() => {
            if (!linkRef.current) {
                errorRef.current = true;
                setError(true);
            }
        }, 5000);

        return () => {
            resizeObserver.disconnect();
            iframe.removeEventListener("load", handleLoad);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            className="ad"
            style={error ? { cursor: "default" } : undefined}
            ref={containerRef}
        >
            {!error ? (
                <iframe ref={iframeRef} src={url} width="300px" height="300px" />
            ) : (
                <div className="ad__no_ad">
                    <div>Здесь могла быть ваша реклама</div>
                    <div>Звоните +7 (999)-999-99-99</div>
                </div>
            )}
            <div className="ad__text">Реклама</div>
            <div
                className="ad__click"
                onClick={() => linkRef.current && window.open(linkRef.current)}
            ></div>
        </div>
    );
}

export default AdBanner;
