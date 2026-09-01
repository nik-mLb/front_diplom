import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
} from "react";
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

export interface TextFieldHandle {
    changeStatus: (newStatus: string) => void;
}

interface TextFieldProps {
    type?: string;
    title?: string;
    value?: string;
    className?: string;
    fieldName?: string;
    isDisabled?: boolean;
    validType?: any;
    canEmpty?: boolean;
    maxLength?: number | string;
    cols?: number;
    min?: number | string;
    max?: number | string;
    status?: string;
    onEnd?: (dataOk: boolean, value: string) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onFocus?: () => void;
    onEnter?: (ev: any) => void;
    onKeyEnter?: () => void;
}

const TextField = forwardRef<TextFieldHandle, TextFieldProps>(
    function TextField(props, ref) {
        const [status, setStatus] = useState("default");
        const [value, setValue] = useState(props.value ?? "");

        useEffect(() => {
            if (props.value) setValue(props.value);
        }, [props.value]);

        useEffect(() => {
            if (props.status) setStatus(props.status);
        }, [props.status]);

        useImperativeHandle(ref, () => ({
            changeStatus: (newStatus: string) => setStatus(newStatus),
        }));

        function handleEnterFinish() {
            if (props.validType !== undefined) {
                if (props.canEmpty && !value) {
                    return;
                }

                const dataOk = validate(props.validType, value);
                setStatus(dataOk ? "success" : "invalid");
                if (props.onEnd) props.onEnd(dataOk, value);
            } else {
                if (props.onEnd) props.onEnd(true, value);
            }
        }

        function handleChange(event: ChangeEvent<HTMLInputElement>) {
            setValue(event.target.value);
            if (props.onChange) props.onChange(event);
        }

        function handleFocus() {
            if (props.onFocus) {
                props.onFocus();
            }
        }

        function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
            if (event.key === "Enter") {
                if (props.onKeyEnter) {
                    props.onKeyEnter();
                }
            }
        }

        const type = props.type ?? TEXTFIELD_TYPES.TEXT;
        const placeholder = props.title ?? "Поле ввода";
        const otherClasses = props.className ?? "";
        const title = props.fieldName ?? "";
        const isDisabled = props.isDisabled ?? false;

        const input = (
            <input
                className={`textField__input textField__input_${status}`}
                type={type}
                placeholder={placeholder}
                value={value}
                disabled={isDisabled}
                onFocus={handleFocus}
                onChange={handleChange}
                onBlur={handleEnterFinish}
                onKeyDown={handleKeyDown}
                maxLength={props.maxLength ?? "255"}
                cols={props.cols}
                min={props.min}
                max={props.max}
            />
        );

        const mark = status !== "default" && (
            <img
                className="textField__mark"
                src={status === "success" ? successIcon : invalidIcon}
            />
        );

        return title ? (
            <div className={`textField_title ${otherClasses}`.trim()}>
                <h3 className="textField_title__title">{title}</h3>
                <div className="textField">
                    {input}
                    {mark}
                </div>
            </div>
        ) : (
            <div className={`textField ${otherClasses}`.trim()}>
                {input}
                {mark}
            </div>
        );
    },
);

export default TextField;
