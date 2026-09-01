import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./styles.scss";

import cartBuyIcon from "../../shared/images/cart-buy-ico.svg";
import cartRemoveIcon from "../../shared/images/cart-remove-ico.svg";
import cartAddIcon from "../../shared/images/cart-add-ico.svg";
import cartSubIcon from "../../shared/images/cart-sub-ico.svg";

import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { AJAXErrors } from "../../api/errors";
import {
    getBasket,
    removeFromBasket,
    updateProductQuantity,
} from "../../api/basket";
import { saveOrderLocal } from "../../api/order";

function showBeautifulNumber(value: number) {
    return value.toLocaleString("ru");
}

function CartPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [discount, setDiscount] = useState(0);

    async function fetchBasket() {
        const response = await getBasket();

        if (response.code === AJAXErrors.NoError) {
            const data = response.data!;
            setItems(data.products);
            setTotal(data.totalPrice);
            setDiscount(data.totalPriceDiscount);
        }

        if (response.code === AJAXErrors.Unauthorized) {
            navigate("/signin");
        }
    }

    useEffect(() => {
        fetchBasket();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleUpdateQuantity(
        productIndex: number,
        countOffset: number,
    ) {
        const product = items[productIndex];

        if (product.quantity + countOffset == 0) {
            handleDelete(productIndex);
            return;
        }

        const response = await updateProductQuantity(
            product.productId,
            product.quantity + countOffset,
        );

        if (response.code === AJAXErrors.NoError) {
            const nextItems = [...items];
            nextItems[productIndex] = {
                ...product,
                quantity: product.quantity + countOffset,
                remainQuantity: response.remainQuantity,
            };
            setItems(nextItems);
            setTotal(total + product.productPrice * countOffset);
            setDiscount(discount + product.priceDiscount * countOffset);
        }
    }

    async function handleDelete(productIndex: number) {
        const product = items[productIndex];
        const code = await removeFromBasket(product.productId);

        if (code === AJAXErrors.NoError) {
            setItems([
                ...items.slice(0, productIndex),
                ...items.slice(productIndex + 1),
            ]);
            setTotal(total - product.productPrice * product.quantity);
            setDiscount(discount - product.priceDiscount * product.quantity);
        }
    }

    async function handleSaveFullBasket() {
        const code = await saveOrderLocal(items);
        if (code === AJAXErrors.NoError) {
            navigate("/place-order");
        }
    }

    async function handleSaveOneProductToBasket(index: number) {
        const code = await saveOrderLocal([{ ...items[index], quantity: 1 }]);
        if (code === AJAXErrors.NoError) {
            navigate("/place-order");
        }
    }

    return (
        <div className="cart-page">
            <Header />
            <main>
                <h1>Моя корзина</h1>
                <div className="content">
                    <div className="content__list">
                        {items.map((item, index) => (
                            <article
                                key={item.productId}
                                className={`content__list__item ${item.remainQuantity < 0 ? "content__list__item_ignore" : ""}`.trim()}
                            >
                                <img
                                    className="content__list__item__cover"
                                    src={item.productImage}
                                />
                                <div className="content__list__item__description">
                                    <div className="content__list__item__description__title">
                                        <div className="content__list__item__description__title__name">
                                            {item.productName}
                                        </div>
                                        <div
                                            className={`content__list__item__description__title__price${item.productPrice - item.priceDiscount != 0 ? " content__list__item__description__title__price_discount" : ""}`}
                                        >
                                            <span className="">
                                                {showBeautifulNumber(
                                                    item.priceDiscount,
                                                )}
                                                &nbsp;₽
                                            </span>
                                            {item.productPrice -
                                                item.priceDiscount !=
                                                0 && (
                                                <span className="content__list__item__description__title__price_discount">
                                                    (
                                                    {
                                                        -parseInt(
                                                            `${((item.productPrice - item.priceDiscount) / item.productPrice) * 100}`,
                                                        )
                                                    }
                                                    %)
                                                </span>
                                            )}
                                        </div>
                                        <div className="content__list__item__description__title__actions">
                                            <Button
                                                disabled={
                                                    item.remainQuantity < 0
                                                }
                                                size="s"
                                                iconSrc={cartSubIcon}
                                                onClick={() =>
                                                    handleUpdateQuantity(
                                                        index,
                                                        -1,
                                                    )
                                                }
                                                className="content__list__item__description__title__actions__hidden"
                                            />
                                            <span className="content__list__item__description__title__actions__count">
                                                {item.remainQuantity < 0
                                                    ? 0
                                                    : item.quantity}
                                            </span>
                                            <Button
                                                disabled={
                                                    item.remainQuantity ===
                                                        0 ||
                                                    item.remainQuantity < 0
                                                }
                                                size="s"
                                                iconSrc={cartAddIcon}
                                                onClick={() =>
                                                    handleUpdateQuantity(
                                                        index,
                                                        1,
                                                    )
                                                }
                                                className="content__list__item__description__title__actions__hidden"
                                            />
                                        </div>
                                    </div>
                                    <div className="content__list__item__description__manage">
                                        <Button
                                            className="content__list__item__description__manage__icon-btn"
                                            size="s"
                                            iconSrc={cartRemoveIcon}
                                            onClick={() =>
                                                handleDelete(index)
                                            }
                                        />
                                        <Button
                                            className="content__list__item__description__manage__btn"
                                            title="Купить"
                                            size="s"
                                            iconSrc={cartBuyIcon}
                                            disabled={item.remainQuantity < 0}
                                            onClick={() =>
                                                handleSaveOneProductToBasket(
                                                    index,
                                                )
                                            }
                                        />
                                        <div className="content__list__item__description__manage__remainCount">
                                            {item.remainQuantity >= 0
                                                ? `Осталось ${showBeautifulNumber(item.remainQuantity)} шт`
                                                : "Закончились"}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {items.length === 0 && (
                            <div className="empty-cart">
                                <i>Вы пока ничего не добавили в корзину</i>
                                &#128521;
                            </div>
                        )}
                    </div>
                    <div className="content__total">
                        <Button
                            className="content__total__make-order"
                            title="Оформление заказа"
                            onClick={() => handleSaveFullBasket()}
                            disabled={
                                items.filter(
                                    (basketItem) =>
                                        basketItem.remainQuantity >= 0,
                                ).length == 0
                            }
                        />
                        <div className="content__total__comment">
                            Способы оплаты и доставки будут доступны на
                            следующем шаге
                        </div>
                        <div className="content__total__discount">
                            <span>Скидка:</span>
                            <span className="content__total__discount__cost">
                                {showBeautifulNumber(total - discount)}
                                &nbsp;₽
                            </span>
                        </div>
                        <div className="content__total__sum-cost">
                            <span>Итог:</span>
                            <span className="content__total__discount__cost">
                                {showBeautifulNumber(discount)}
                                &nbsp;₽
                            </span>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CartPage;
