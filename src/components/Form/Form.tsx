import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import validate from "bazaar-validation";
import TextField from "../TextField/TextField";

export interface FormField {
    id: string;
    type?: string;
    validType?: any;
    title?: string;
    defaultValue?: string;
}

export interface FormHandle {
    validate: () => Record<string, any> | false;
    setFieldStatus: (field: string, isInvalid: boolean) => void;
}

interface FormProps {
    form: FormField[];
    className?: string;
    onEnd?: (invalidField: string) => void;
    onFieldFocus?: (field: string) => void;
}

const Form = forwardRef<FormHandle, FormProps>(function Form(props, ref) {
    const [form, setForm] = useState<Record<string, any>>(() => {
        const initForm: Record<string, any> = {};
        props.form.forEach((field) => {
            if (field.defaultValue !== "") {
                initForm[field.id] = field.defaultValue;
            }
        });
        return initForm;
    });
    const [invalidFields, setInvalidFields] = useState<
        Record<string, boolean>
    >({});

    const formRef = useRef(form);
    formRef.current = form;
    const invalidFieldsRef = useRef(invalidFields);
    invalidFieldsRef.current = invalidFields;

    function setFieldStatus(field: string, isInvalid: boolean) {
        const next = { ...invalidFieldsRef.current, [field]: isInvalid };
        invalidFieldsRef.current = next;
        setInvalidFields(next);
    }

    function handleFieldEnd(id: string, isSuccess: boolean, fieldValue: any) {
        const nextInvalidFields = {
            ...invalidFieldsRef.current,
            [id]: !isSuccess,
        };
        const nextForm = { ...formRef.current, [id]: fieldValue };
        invalidFieldsRef.current = nextInvalidFields;
        formRef.current = nextForm;
        setInvalidFields(nextInvalidFields);
        setForm(nextForm);

        let invalidField = "";
        props.form.forEach((field) => {
            const fieldOk =
                field.validType !== undefined
                    ? validate(field.validType, nextForm[field.id] ?? "")
                    : true;
            if (!fieldOk && nextInvalidFields[field.id] !== undefined) {
                invalidField ||= field.id;
            }
        });
        if (props.onEnd) props.onEnd(invalidField);
    }

    useImperativeHandle(ref, () => ({
        validate: () => {
            let invalidField = "";
            const nextForm = { ...formRef.current };
            const nextInvalidFields = { ...invalidFieldsRef.current };

            props.form.forEach((field) => {
                const fieldOk =
                    field.validType !== undefined
                        ? validate(field.validType, nextForm[field.id] ?? "")
                        : true;
                if (!fieldOk) invalidField ||= field.id;
                nextInvalidFields[field.id] = !fieldOk;
                nextForm[field.id] = nextForm[field.id] ?? "";
            });

            formRef.current = nextForm;
            invalidFieldsRef.current = nextInvalidFields;
            setForm(nextForm);
            setInvalidFields(nextInvalidFields);

            if (props.onEnd) props.onEnd(invalidField);
            return invalidField === "" ? nextForm : false;
        },
        setFieldStatus,
    }));

    const otherClasses = props.className ?? "";

    return (
        <div className={`${otherClasses}`.trim()}>
            {props.form.map((formField) => (
                <TextField
                    key={formField.id}
                    type={formField.type}
                    validType={formField.validType}
                    title={formField.title}
                    value={formField.defaultValue ?? ""}
                    status={
                        invalidFields[formField.id] !== undefined
                            ? !invalidFields[formField.id]
                                ? "success"
                                : "invalid"
                            : "default"
                    }
                    onFocus={() =>
                        props.onFieldFocus && props.onFieldFocus(formField.id)
                    }
                    onEnd={(isSuccess, fieldValue) =>
                        handleFieldEnd(formField.id, isSuccess, fieldValue)
                    }
                />
            ))}
        </div>
    );
});

export default Form;
