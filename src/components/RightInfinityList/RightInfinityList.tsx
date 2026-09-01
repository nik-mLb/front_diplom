import { Fragment, useEffect, useReducer, useRef, type ReactNode } from "react";
import "./styles.scss";

function calculateColumns(
    parent: HTMLDivElement,
    minmax: number,
    rowGap: number,
    columnGap: number,
) {
    const width = parent.clientWidth;
    return parseInt((width + columnGap) / (minmax + columnGap) + "");
}

async function fill(
    n: number,
    container: HTMLDivElement,
    func: (count: number) => Promise<number>,
    minmax: number,
    rowGap: number,
    columnGap: number,
) {
    if (minmax === -1) return 1;
    const rect = container.getBoundingClientRect();
    const cols = calculateColumns(container, minmax, rowGap, columnGap);
    if (rect.bottom - window.innerHeight < 0) {
        const colsFill = cols === 0 ? 3 : cols - (n % cols);
        if ((await func(colsFill)) !== 0) {
            setTimeout(() =>
                fill(n + colsFill, container, func, minmax, rowGap, columnGap),
            );
        }
    }
}

interface RightInfinityListProps {
    className?: string;
    builder: (item: any, index: number) => ReactNode;
    onLoad: (offset: number) => Promise<any[]>;
    elementMinWidth: number;
    offsetRow: number;
    offsetCol: number;
}

function RightInfinityList(props: RightInfinityListProps) {
    const propsRef = useRef(props);
    propsRef.current = props;

    const containerRef = useRef<HTMLDivElement>(null);

    const itemsRef = useRef<any[]>([]);
    const startIndexRef = useRef(0);
    const endIndexRef = useRef(0);
    const finishedRef = useRef(false);
    const blockedRef = useRef(false);

    const [, forceRender] = useReducer((x) => x + 1, 0);

    function setListState(patch: {
        items?: any[];
        startIndex?: number;
        endIndex?: number;
        finished?: boolean;
        blocked?: boolean;
    }) {
        if (patch.items !== undefined) itemsRef.current = patch.items;
        if (patch.startIndex !== undefined)
            startIndexRef.current = patch.startIndex;
        if (patch.endIndex !== undefined) endIndexRef.current = patch.endIndex;
        if (patch.finished !== undefined) finishedRef.current = patch.finished;
        if (patch.blocked !== undefined) blockedRef.current = patch.blocked;
        forceRender();
    }

    function clearPrevious(count: number) {
        setListState({ startIndex: startIndexRef.current + count });
    }

    function renderPrevious(count: number) {
        setListState({ startIndex: startIndexRef.current - count });
    }

    function clearNext(count: number) {
        setListState({
            endIndex: endIndexRef.current - count,
            finished: false,
        });
    }

    async function renderNext(count: number): Promise<number> {
        if (finishedRef.current || blockedRef.current) return 0;
        blockedRef.current = true;
        const addCount = count;
        count -= itemsRef.current.length - endIndexRef.current;
        if (count > 0) {
            const newItems: any[] = [];
            while (count > 0) {
                const loaded = await propsRef.current.onLoad(
                    itemsRef.current.length + newItems.length,
                );
                if (loaded.length === 0) break;
                newItems.push(...loaded);
                count = Math.max(count - loaded.length, 0);
            }
            const updatedItems = [...itemsRef.current, ...newItems];
            setListState({
                items: updatedItems,
                endIndex:
                    count > 0
                        ? updatedItems.length
                        : endIndexRef.current + addCount,
                finished: count > 0,
                blocked: false,
            });
            return Math.min(newItems.length, addCount);
        }
        setListState({
            endIndex: endIndexRef.current + addCount,
            blocked: false,
        });
        return addCount;
    }

    async function handleScroll(container: HTMLDivElement) {
        const rect = container.getBoundingClientRect();
        const heightOffset = rect.top;
        const firstChild = container.firstChild as HTMLElement | null;

        if (!firstChild) return;

        const height = firstChild.clientHeight + propsRef.current.offsetRow;
        const cols = calculateColumns(
            container,
            propsRef.current.elementMinWidth,
            propsRef.current.offsetRow,
            propsRef.current.offsetCol,
        );
        const realCols = endIndexRef.current - startIndexRef.current;

        if (-heightOffset > height) {
            clearPrevious(cols - (realCols > cols ? 0 : realCols % cols));
            container.style.marginTop =
                (parseInt(container.style.marginTop) || 0) + height + "px";
        } else if (
            heightOffset >= propsRef.current.offsetRow / 2 &&
            startIndexRef.current > 0
        ) {
            renderPrevious(cols - (realCols > cols ? 0 : realCols % cols));
            container.style.marginTop =
                (parseInt(container.style.marginTop) || 0) - height + "px";
        } else if (
            rect.bottom - window.innerHeight <= 0 &&
            !blockedRef.current
        ) {
            await renderNext(cols - (realCols % cols));
            container.style.marginBottom =
                Math.max(
                    0,
                    (parseInt(container.style.marginBottom) || 0) - height,
                ) + "px";
        } else if (rect.bottom - window.innerHeight > height) {
            clearNext(
                endIndexRef.current != itemsRef.current.length
                    ? cols
                    : itemsRef.current.length % cols,
            );
            container.style.marginBottom =
                (parseInt(container.style.marginBottom) || 0) + height + "px";
        }
    }

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onScroll = () => handleScroll(container);
        const onResize = () => handleScroll(container);
        document.addEventListener("scroll", onScroll);
        window.addEventListener("resize", onResize);

        fill(
            0,
            container,
            (n) => renderNext(n),
            propsRef.current.elementMinWidth,
            propsRef.current.offsetRow,
            propsRef.current.offsetCol,
        );

        return () => {
            document.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className={`infinity-list ${props.className}`.trim()}
            ref={containerRef}
        >
            {itemsRef.current
                .slice(startIndexRef.current, endIndexRef.current)
                .map((e, I) => (
                    <Fragment key={I + startIndexRef.current}>
                        {props.builder(e, I + startIndexRef.current)}
                    </Fragment>
                ))}
        </div>
    );
}

export default RightInfinityList;
