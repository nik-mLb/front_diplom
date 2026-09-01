import { useState } from "react";
import { ValidTypes } from "bazaar-validation";

import TextField from "../TextField/TextField";
import Button from "../Button/Button";

import crossIcon from "../../shared/images/cross-ico.svg";
import "./styles.scss";

interface PromocodeForm {
    name: string;
    percent: string;
    startDate: string;
    endDate: string;
}

interface PromocodeModalProps {
    opened?: boolean;
    onClose?: () => void;
    onFinish: (form: {
        name: string;
        percent: string;
        start: Date;
        end: Date;
    }) => void;
}

function PromocodeModal({ opened, onClose, onFinish }: PromocodeModalProps) {
    const [form, setForm] = useState<PromocodeForm>({
        name: "",
        percent: "",
        startDate: "",
        endDate: "",
    });

    function handleUpdateForm(name: keyof PromocodeForm, value: string) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <div className={`promocode-modal${!opened ? " close" : ""}`}>
            <div className="promocode-modal__modal-shadow"></div>
            <div className="promocode-modal__modal-content">
                <div className="promocode-modal__modal-content__title">
                    <h2>Добавление нового промокода</h2>
                    <img
                        className="promocode-modal__modal-content__title__close-button"
                        src={crossIcon}
                        onClick={() => onClose && onClose()}
                    />
                </div>
                <hr />
                <p className="promocode-modal__modal-content__description">
                    <TextField
                        className="address-modal__modal-content__description__name"
                        title="Промокод"
                        validType={ValidTypes.NotNullValid}
                        value={form.name}
                        onEnd={(ok, value) => handleUpdateForm("name", value)}
                    />
                    <TextField
                        type="number"
                        className="address-modal__modal-content__description__name"
                        title="Скидка"
                        value={form.name}
                        onEnd={(ok, value) =>
                            handleUpdateForm("percent", value)
                        }
                    />
                    <div style={{ fontWeight: "bold" }}>Срок действия:</div>
                    <TextField
                        type="datetime-local"
                        className="address-modal__modal-content__description__name"
                        title="Дата начала"
                        value={form.startDate}
                        onEnd={(ok, value) =>
                            handleUpdateForm("startDate", value)
                        }
                    />
                    <TextField
                        type="datetime-local"
                        className="address-modal__modal-content__description__name"
                        title="Дата окончания"
                        value={form.endDate}
                        onEnd={(ok, value) =>
                            handleUpdateForm("endDate", value)
                        }
                    />
                </p>
                <div className="promocode-modal__modal-content__actions">
                    <Button
                        className="promocode-modal__modal__actions__save"
                        title="Добавить промокод"
                        disabled={
                            !(
                                form.name &&
                                form.percent &&
                                form.startDate &&
                                form.endDate
                            )
                        }
                        onClick={() => {
                            if (
                                form.name &&
                                form.percent &&
                                form.startDate &&
                                form.endDate
                            ) {
                                const dt1 = new Date(form.startDate);
                                const dt2 = new Date(form.endDate);
                                if (dt1.getTime() < dt2.getTime()) {
                                    onFinish({
                                        name: form.name,
                                        percent: form.percent,
                                        start: dt1,
                                        end: dt2,
                                    });
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default PromocodeModal;
