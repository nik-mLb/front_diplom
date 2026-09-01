import { forwardRef, useImperativeHandle, useState } from "react";

import "./styles.scss";

import crossIcon from "../../shared/images/cross-ico.svg";
import Button from "../Button/Button";
import { Product } from "../../api/product";
import { convertMoney } from "../../pages/AdminPage/AdminPage";

export interface ProductRequestModalHandle {
    handleOpen: () => void;
    handleClose: () => void;
}

interface ProductRequestModalProps {
    request: Product | null;
    onSuccess: () => void;
    onDenied: () => void;
}

const ProductRequestModal = forwardRef<
    ProductRequestModalHandle,
    ProductRequestModalProps
>(function ProductRequestModal({ request, onSuccess, onDenied }, ref) {
    const [status, setStatus] = useState("closed");

    useImperativeHandle(ref, () => ({
        handleOpen: () => setStatus("opened"),
        handleClose: () => setStatus("closed"),
    }));

    return (
        <div className="request-modal">
            <div
                className={"request-modal__tint " + status}
                onClick={() => setStatus("closed")}
            />
            <div className={"request-modal__content " + status}>
                <div className="request-modal__content__title">
                    <div className="request-modal__content__title__h">
                        Заявка
                    </div>
                    <div className="request-modal__content__title__close">
                        <img
                            className="alert__title__close__img"
                            src={crossIcon}
                            onClick={() => setStatus("closed")}
                        />
                    </div>
                </div>
                <div className="request-modal__content__data">
                    <div className="request-modal__content__data__icon">
                        <img
                            className="request-modal__content__data__icon__img"
                            src={request?.image}
                        />
                    </div>
                    <div className="request-modal__content__data__item">
                        <div className="request-modal__content__data__item__name">
                            Название
                        </div>
                        <div className="request-modal__content__data__item__value">
                            {request?.name}
                        </div>
                    </div>
                    <div className="request-modal__content__data__item">
                        <div className="request-modal__content__data__item__name">
                            Описание
                        </div>
                        <div className="request-modal__content__data__item__value">
                            {request?.description}
                        </div>
                    </div>
                    <div className="request-modal__content__data__item">
                        <div className="request-modal__content__data__item__name">
                            Цена
                        </div>
                        <div className="request-modal__content__data__item__value">
                            {convertMoney(request?.price ?? 0)}
                        </div>
                    </div>
                    <div className="request-modal__content__data__item">
                        <div className="request-modal__content__data__item__name">
                            Владелец
                        </div>
                        <div className="request-modal__content__data__item__value">
                            {request?.seller.title}
                        </div>
                    </div>
                </div>
                <div className="request-modal__content__actions">
                    <Button title="Одобрить товар" onClick={() => onSuccess()} />
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

export default ProductRequestModal;
