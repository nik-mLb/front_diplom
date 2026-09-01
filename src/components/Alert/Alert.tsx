import { useEffect, useRef, type ReactNode } from "react";
import Button from "../Button/Button";

import crossIcon from "../../shared/images/cross-ico.svg";

import "./styles.scss";

interface AlertProps {
    title?: ReactNode;
    content?: ReactNode;
    successButtonTitle?: string;
    onClose?: () => void;
    onSuccess?: () => void;
}

function Alert(props: AlertProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.animation =
                " 0.2s showing-animation linear";
        }
    }, []);

    return (
        <div className="alert" ref={containerRef}>
            <div className="alert__title">
                <div className="alert__title__h">{props.title}</div>
                <div className="alert__title__close">
                    <img
                        className="alert__title__close__img"
                        src={crossIcon}
                        onClick={() => props.onClose && props.onClose()}
                    />
                </div>
            </div>
            <div className="alert__content">{props.content}</div>
            <div className="alert__actions">
                <Button
                    title={props.successButtonTitle ?? "ОК"}
                    variant="primary"
                    onClick={() => props.onSuccess && props.onSuccess()}
                />
            </div>
        </div>
    );
}

export default Alert;
