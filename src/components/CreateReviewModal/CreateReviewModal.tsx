import { useEffect, useRef, useState } from "react";
import Button from "../Button/Button";

import crossIcon from "../../shared/images/cross-ico.svg";
import StarIcon from "../../shared/images/star-ico.svg";
import StarFilledIcon from "../../shared/images/star-filled-ico.svg";
import TextArea from "../TextArea/TextArea";

import "./styles.scss";

interface CreateReviewModalProps {
    onSend?: (description: string, rating: number) => void;
    onClose?: () => void;
}

function CreateReviewModal(props: CreateReviewModalProps) {
    const [description, setDescription] = useState("");
    const [starsSelected, setStarsSelected] = useState(0);
    const [starsHover, setStarsHover] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.animation =
                "0.3s review-modal-showing-animation linear";
        }
    }, []);

    return (
        <div className="review-modal" ref={containerRef}>
            <div className="review-modal__tint" />
            <div className="review-modal__content">
                <div className="review-modal__content__title">
                    <div className="review-modal__content__title__h">
                        Оставить отзыв
                    </div>
                    <div className="review-modal__content__title__close">
                        <img
                            className="review-modal__content__title__close__img"
                            src={crossIcon}
                            onClick={() => props.onClose && props.onClose()}
                        />
                    </div>
                </div>
                <div className="review-modal__content__form">
                    <div className="review-modal__content__form__rating">
                        <div className="review-modal__content__form__rating__title">
                            Рейтинг:
                        </div>
                        <div className="review-modal__content__form__rating__value">
                            {Array(5)
                                .fill(0)
                                .map((_, I) => (
                                    <img
                                        key={I}
                                        className={
                                            starsHover !== 0 &&
                                            starsHover <= I &&
                                            starsSelected > I
                                                ? "review-modal__content__form__rating__value__star removed"
                                                : "review-modal__content__form__rating__value__star"
                                        }
                                        src={
                                            starsHover > I ||
                                            starsSelected > I
                                                ? StarFilledIcon
                                                : StarIcon
                                        }
                                        onMouseOver={() =>
                                            setStarsHover(I + 1)
                                        }
                                        onMouseLeave={() => setStarsHover(0)}
                                        onClick={() =>
                                            setStarsSelected(starsHover)
                                        }
                                    />
                                ))}
                        </div>
                    </div>
                    <TextArea
                        rows={5}
                        type="textarea"
                        className="review-modal__content__form__description"
                        title="Комментарий"
                        onChange={(ev: any) =>
                            setDescription(ev.target.value)
                        }
                    />
                </div>
                <div className="review-modal__content__actions">
                    <Button
                        title="Отправить"
                        variant="primary"
                        onClick={() =>
                            props.onSend &&
                            props.onSend(description, starsSelected)
                        }
                        disabled={description === "" || starsSelected === 0}
                    />
                </div>
            </div>
        </div>
    );
}

export default CreateReviewModal;
