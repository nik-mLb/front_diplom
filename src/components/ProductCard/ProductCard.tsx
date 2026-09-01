import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button, {
    BUTTON_SIZE,
    BUTTON_VARIANT,
    ICON_POSITION,
} from "../Button/Button";

import CardButtonIcon from "../../shared/images/productCard-cart-ico.svg";
import StarIcon from "../../shared/images/productCard-star-ico.svg";

import "./styles.scss";
import { addToBasket } from "../../api/basket";
import { AJAXErrors } from "../../api/errors";

interface ProductCardProps {
    id: string;
    inCart?: boolean;
    mainImageAlt?: string;
    mainImageSrc?: string;
    price: number;
    discountPrice?: number;
    brand?: string;
    title?: string;
    rating: number | string;
    reviewsCount: number;
    onError?: (code: AJAXErrors) => void;
}

function ProductCard(props: ProductCardProps) {
    const navigate = useNavigate();
    const [isInCart, setIsInCart] = useState(!!props.inCart);

    async function handleAddToCart(itemId: string) {
        const code = await addToBasket(itemId);

        if (code === AJAXErrors.NoError) {
            setIsInCart(true);
        }

        if (code === AJAXErrors.Unauthorized) {
            if (props.onError) props.onError(AJAXErrors.Unauthorized);
        }
    }

    return (
        <article className="product-card flex column">
            <div
                className="product-card__body"
                onClick={() => navigate(`/product/${props.id}`)}
            >
                <div className="product-card__carousel-images">
                    <div className="product-card__carousel-images__active-image-wrapper">
                        <img
                            className="product-card__carousel-images__active-image-wrapper__card-image"
                            alt={`${props.mainImageAlt}`}
                            src={`${props.mainImageSrc}`}
                        />
                    </div>

                    <div className="product-card__carousel-images__controls"></div>
                </div>

                <div className="product-card__prices full-wide">
                    <div
                        className={`product-card__prices__sell-price${props.discountPrice != 0 ? " discount" : ""}`}
                    >
                        {props.discountPrice || props.price} ₽
                    </div>
                    {props.discountPrice != 0 && (
                        <div className="product-card__prices__old-price">
                            {props.price} ₽
                        </div>
                    )}
                    {props.discountPrice != 0 && (
                        <div className="product-card__prices__sale-percentage">
                            {`${-parseInt(
                                `${
                                    ((props.price - (props.discountPrice ?? 0)) /
                                        props.price) *
                                    100
                                }`,
                            )}`}
                            %
                        </div>
                    )}
                </div>

                {props.brand && (
                    <div className="product-card__brand full-wide">
                        {props.brand}
                    </div>
                )}

                <div className="product-card__product-title full-wide">
                    {props.title}
                </div>

                <div className="product-card__reviews flex full-wide">
                    <div className="product-card__reviews__star-block flex">
                        <img
                            className="product-card__reviews__star-block__star-text"
                            src={StarIcon}
                        />
                        <span>{parseFloat(`${props.rating}`).toFixed(2)}</span>
                    </div>
                    <div className="product-card__reviews__star-block__count-block">
                        {props.reviewsCount} отзывов
                    </div>
                </div>
            </div>

            <div className="product-card__reviews__star-block__product-manip full-wide">
                <Button
                    size={`${BUTTON_SIZE.L}`}
                    variant={`${BUTTON_VARIANT.PRIMARY}`}
                    iconPosition={`${ICON_POSITION.LEFT}`}
                    className={`full-wide ${isInCart ? "product-card__product-manip__in-cart-btn" : ""}`}
                    iconAlt={isInCart ? "" : "Иконка корзины"}
                    iconSrc={`${isInCart ? "" : CardButtonIcon}`}
                    title={isInCart ? "В корзине" : "В корзину"}
                    onClick={() => {
                        if (isInCart) {
                            navigate("/cart");
                        } else {
                            handleAddToCart(props.id);
                        }
                    }}
                />
            </div>
        </article>
    );
}

export default ProductCard;
