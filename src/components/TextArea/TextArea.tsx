import { useEffect, useState, type ChangeEvent } from "react";
import "./styles.scss";

import invalidIcon from "../../shared/images/textfield-invalid.svg";
import successIcon from "../../shared/images/textfield-success.svg";
import validate from "bazaar-validation";

export const TEXTFIELD_TYPES = {
    SEARCH: "search",
    TEXT: "text",
    INPUT: "input",
    EMAIL: "email",
    NUMBER: "number",
    FILE: "file",
    SUBMIT: "submit",
    TIME: "time",
    BUTTON: "button",
    HIDDEN: "hidden",
};

interface TextAreaProps {
    title?: string;
    value?: string;
    className?: string;
    fieldName?: string;
    isDisabled?: boolean;
    validType?: any;
    rows?: number;
    status?: string;
    onEnd?: (dataOk: boolean, value: string) => void;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    onFocus?: () => void;
}

function TextArea(props: TextAreaProps) {
    const [status, setStatus] = useState("default");
    const [value, setValue] = useState(props.value ?? "");

    useEffect(() => {
        if (props.value) setValue(props.value);
    }, [props.value]);

    useEffect(() => {
        if (props.status) setStatus(props.status);
    }, [props.status]);

    function handleEnterFinish() {
        const dataOk =
            props.validType !== undefined
                ? validate(props.validType, value)
                : true;
        setStatus(dataOk ? "success" : "invalid");
        if (props.onEnd) props.onEnd(dataOk, value);
    }

    function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setValue(event.target.value);
        if (props.onChange) props.onChange(event);
    }

    function handleFocus() {
        if (props.onFocus) props.onFocus();
    }

    const placeholder = props.title ?? "Поле ввода";
    const otherClasses = props.className ?? "";
    const title = props.fieldName ?? "";
    const isDisabled = props.isDisabled ?? false;
    const visibleStatus = props.validType !== undefined ? status : "default";

    const textarea = (
        <textarea
            className={`textArea__input textArea__input_${visibleStatus}`}
            placeholder={placeholder}
            value={value}
            disabled={isDisabled}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleEnterFinish}
            rows={props.rows}
        />
    );

    const mark = visibleStatus !== "default" && (
        <img
            className="textArea__mark"
            src={status === "success" ? successIcon : invalidIcon}
        />
    );

    return title ? (
        <div className={`textArea_title ${otherClasses}`.trim()}>
            <h3 className="textArea_title__title">{title}</h3>
            <div className="textArea">
                {textarea}
                {mark}
            </div>
        </div>
    ) : (
        <div className={`textArea ${otherClasses}`.trim()}>
            {textarea}
            {mark}
        </div>
    );
}

export default TextArea;
