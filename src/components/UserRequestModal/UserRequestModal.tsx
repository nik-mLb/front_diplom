import { forwardRef, useImperativeHandle, useState } from "react";

import "./styles.scss";

import crossIcon from "../../shared/images/cross-ico.svg";
import Button from "../Button/Button";
import { UserRequest } from "../../api/admin";

export interface UserRequestModalHandle {
    handleOpen: () => void;
    handleClose: () => void;
}

interface UserRequestModalProps {
    request: UserRequest | null;
    onSuccess: () => void;
    onDenied: () => void;
}

const UserRequestModal = forwardRef<
    UserRequestModalHandle,
    UserRequestModalProps
>(function UserRequestModal({ request, onSuccess, onDenied }, ref) {
    const [status, setStatus] = useState("closed");

    useImperativeHandle(ref, () => ({
        handleOpen: () => setStatus("opened"),
        handleClose: () => setStatus("closed"),
    }));

    return (
        <div className="product-modal">
            <div
                className={"product-modal__tint " + status}
                onClick={() => setStatus("closed")}
            />
            <div className={"product-modal__content " + status}>
                <div className="product-modal__content__title">
                    <div className="product-modal__content__title__h">
                        Заявка
                    </div>
                    <div className="product-modal__content__title__close">
                        <img
                            className="alert__title__close__img"
                            src={crossIcon}
                            onClick={() => setStatus("closed")}
                        />
                    </div>
                </div>
                <div className="product-modal__content__data">
                    <div className="product-modal__content__data__item">
                        <div className="product-modal__content__data__item__name">
                            Название продукта
                        </div>
                        <div className="product-modal__content__data__item__value">
                            {request?.sellerInfo.title}
                        </div>
                    </div>
                    <div className="product-modal__content__data__item">
                        <div className="product-modal__content__data__item__name">
                            Описание компании
                        </div>
                        <div className="product-modal__content__data__item__value">
                            {request?.sellerInfo.description}
                        </div>
                    </div>
                    <div className="product-modal__content__data__item">
                        <div className="product-modal__content__data__item__name">
                            Владелец
                        </div>
                        <div className="product-modal__content__data__item__value">
                            {`${request?.surname ?? ""} ${request?.name}`.trim()}
                        </div>
                    </div>
                    <div className="product-modal__content__data__item">
                        <div className="product-modal__content__data__item__name">
                            Email владельца
                        </div>
                        <div className="product-modal__content__data__item__value">
                            {request?.email}
                        </div>
                    </div>
                </div>
                <div className="product-modal__content__actions">
                    <Button title="Одобрить заявку" onClick={() => onSuccess()} />
                    <Button
                        title="Отказать"
                        variant="text"
                        onClick={() => onDenied()}
                    />
                </div>
            </div>
        </div>
    );
});

export default UserRequestModal;
