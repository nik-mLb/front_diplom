import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./styles.scss";
import { getProduct } from "../../api/product";
import { AJAXErrors } from "../../api/errors";
import Button from "../../components/Button/Button";

import ProfileIcon from "../../shared/images/header-profile-ico.svg";
import cartAddIcon from "../../shared/images/cart-add-ico.svg";
import cartSubIcon from "../../shared/images/cart-sub-ico.svg";
import StarIcon from "../../shared/images/star-ico.svg";
import StarFilledIcon from "../../shared/images/star-filled-ico.svg";

import {
    addToBasket,
    getBasket,
    removeFromBasket,
    updateProductQuantity,
} from "../../api/basket";
import { getComments, sendComment } from "../../api/comments";
import CreateReviewModal from "../../components/CreateReviewModal/CreateReviewModal";
import Alert from "../../components/Alert/Alert";
import InfinityList from "../../components/InfinityList/InfinityList";
import { convertMoney } from "../AdminPage/AdminPage";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getRecommendations } from "../../api/recommendation";
import { useUserStore } from "../../stores/UserStore";

function ProductPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const userStore = useUserStore();

    const [product, setProduct] = useState<any>(null);
    const [commentsOffset, setCommentsOffset] = useState(0);
    const [comments, setComments] = useState<any[]>([]);
    const [addReviewModal, setAddReviewModal] = useState(false);

    const [showNotAuthAlert, setShowNotAuthAlert] = useState(false);
    const [showNotAuthAlertCart, setShowNotAuthAlertCart] = useState(false);
    const [twiceReview, setTwiceReview] = useState(false);

    const [showComments, setShowComments] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    const fetchingRef = useRef(false);
    const productRef = useRef(product);
    productRef.current = product;
    const commentsOffsetRef = useRef(commentsOffset);
    commentsOffsetRef.current = commentsOffset;
    const commentsRef = useRef(comments);
    commentsRef.current = comments;

    const isFirstMountRef = useRef(true);

    async function fetchProduct(currentProductId: string) {
        const { code: basketCode, data } = await getBasket();
        let quantity = 0;
        const basket = new Set();

        if (basketCode === AJAXErrors.NoError) {
            for (const item of data!.products) {
                if (item.productId === currentProductId) {
                    quantity = item.quantity;
                    break;
                }
            }

            data!.products.forEach((item) => basket.add(item.productId));
        }

        const { code: productCode, product: fetchedProduct } =
            await getProduct(currentProductId);
        if (productCode === AJAXErrors.NoError) {
            setProduct({
                ...fetchedProduct,
                quantity,
            });
            fetchReviews(currentProductId);
        } else {
            navigate("/");
            return;
        }

        const { code, products } = await getRecommendations(
            currentProductId as any,
        );
        if (code === AJAXErrors.NoError) {
            setRecommendations(
                (products ?? []).map((item: any) => ({
                    ...item,
                    isInCart: basket.has(item.id),
                })),
            );
        }
    }

    async function handleAddProduct() {
        let code: AJAXErrors;

        if (productRef.current.quantity === 0) {
            code = await addToBasket(productRef.current.id);
        } else {
            code = (
                await updateProductQuantity(
                    productRef.current.id,
                    productRef.current.quantity + 1,
                )
            ).code;
        }

        if (code === AJAXErrors.NoError) {
            setProduct({
                ...productRef.current,
                quantity: productRef.current.quantity + 1,
            });
        }
    }

    async function handleRemoveProduct() {
        let code: AJAXErrors;

        if (productRef.current.quantity === 1) {
            code = await removeFromBasket(productRef.current.id);
        } else {
            code = (
                await updateProductQuantity(
                    productRef.current.id,
                    productRef.current.quantity - 1,
                )
            ).code;
        }

        if (code === AJAXErrors.NoError) {
            setProduct({
                ...productRef.current,
                quantity: productRef.current.quantity - 1,
            });
        }
    }

    async function fetchReviews(currentProductId: string) {
        if (!productRef.current && !currentProductId) {
            return;
        }
        if (fetchingRef.current) {
            return;
        }
        fetchingRef.current = true;
        const { code, reviews } = await getComments(
            currentProductId ?? productRef.current.id,
            commentsOffsetRef.current,
        );
        if (code === AJAXErrors.NoError) {
            setCommentsOffset(commentsOffsetRef.current + 7);
            setComments([...commentsRef.current, ...(reviews ?? [])]);
            fetchingRef.current = false;
        } else {
            fetchingRef.current = false;
        }
    }

    async function sendReview(description: string, rating: number) {
        const code = await sendComment(
            productRef.current?.id ?? "",
            rating,
            description,
        );

        if (code === AJAXErrors.NoError) {
            setComments([
                {
                    id: "0",
                    name: userStore.value.name,
                    surname: userStore.value.surname,
                    imageURL: userStore.value.imageURL,
                    rating: rating,
                    comment: description,
                },
                ...commentsRef.current,
            ]);
            setProduct({
                ...productRef.current,
                reviewsCount: productRef.current.reviewsCount + 1,
                rating:
                    (productRef.current.rating *
                        productRef.current.reviewsCount +
                        rating) /
                    (productRef.current.reviewsCount + 1),
            });
            setAddReviewModal(false);
        }

        if (code === AJAXErrors.TwiceReview) {
            setTwiceReview(true);
            setAddReviewModal(false);
        }
    }

    useEffect(() => {
        if (!productId) {
            navigate("/");
            return;
        }
        if (!isFirstMountRef.current) {
            window.scroll({
                top: 0,
                behavior: "smooth",
            });
        }
        isFirstMountRef.current = false;
        fetchProduct(productId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    return (
        <div className="product-page">
            <Header />
            <main className="product-page__main">
                <div className="product-page__main__card">
                    <div className="product-page__main__card__image">
                        <img src={`${product?.image}`} />
                    </div>
                    <div className="product-page__main__card__details">
                        <h2
                            className="product-page__main__card__details__title"
                            style={{ fontWeight: "normal" }}
                        >
                            {product?.name}
                        </h2>
                        <div className="product-page__main__card__details__buyer">
                            {product?.seller.title}
                        </div>
                        {product && (
                            <div className="product-page__main__card__details__action">
                                <span
                                    className={`product-page__main__card__details__action__price${product.discountPrice !== 0 ? "-discount" : "-default"}`}
                                >
                                    {convertMoney(
                                        product.discountPrice ||
                                            product.price,
                                    )}
                                </span>
                                {product.discountPrice !== 0 && (
                                    <span className="product-page__main__card__details__action__discount">
                                        (-
                                        {parseInt(
                                            `${((product.price - product.discountPrice) / product.price) * 100}`,
                                        )}
                                        %)
                                    </span>
                                )}
                                <div className="product-page__main__card__details__action__buy">
                                    <Button
                                        disabled={product.quantity === 0}
                                        size="m"
                                        iconSrc={cartSubIcon}
                                        className="no-text"
                                        onClick={() => {
                                            if (!userStore.value.login) {
                                                setShowNotAuthAlertCart(true);
                                            } else {
                                                handleRemoveProduct();
                                            }
                                        }}
                                    />
                                    <Button
                                        disabled={product.remainQuantity ?? 0 < 0}
                                        size="m"
                                        title={
                                            product.quantity === 0
                                                ? "Добавить в корзину"
                                                : `Добавлено ${product.quantity} шт`
                                        }
                                        className={
                                            product.quantity !== 0
                                                ? "product-page__main__card__details__action__buy__in-cart"
                                                : "product-page__main__card__details__action__buy"
                                        }
                                        onClick={() => {
                                            if (!userStore.value.login) {
                                                setShowNotAuthAlertCart(true);
                                            } else {
                                                handleAddProduct();
                                            }
                                        }}
                                    />
                                    <Button
                                        disabled={
                                            product.remainQuantity === 0 ||
                                            product.remainQuantity < 0
                                        }
                                        size="m"
                                        iconSrc={cartAddIcon}
                                        className="no-text"
                                        onClick={() => {
                                            if (!userStore.value.login) {
                                                setShowNotAuthAlertCart(true);
                                            } else {
                                                handleAddProduct();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="product-page__main__description">
                    <h2>Описание</h2>
                    <div className="product-page__main__description__value">
                        {product?.description}
                    </div>
                </div>
                <div className="product-page__main__reviews">
                    <div className="product-page__main__reviews__title">
                        <h2>
                            Отзывы (
                            <img
                                className="product-page__main__reviews__title__star"
                                src={StarFilledIcon}
                            />
                            {parseFloat(product?.rating).toFixed(2)})
                        </h2>
                        {showNotAuthAlert && (
                            <Alert
                                title="Необходимо войти"
                                content="Чтобы оставить отзыв, надо сначала войти в профиль"
                                successButtonTitle="Войти"
                                onSuccess={() => navigate("/signin")}
                                onClose={() => setShowNotAuthAlert(false)}
                            />
                        )}
                        {showNotAuthAlertCart && (
                            <Alert
                                title="Необходимо войти"
                                content="Чтобы изменить продукты в корзине, надо сначала войти в профиль"
                                successButtonTitle="Войти"
                                onSuccess={() => navigate("/signin")}
                                onClose={() => setShowNotAuthAlertCart(false)}
                            />
                        )}
                        {twiceReview && (
                            <Alert
                                title="Вы уже оставили отзыв"
                                content="Вы уже оставили свой отзыв на данный продукт"
                                successButtonTitle="ОК"
                                onSuccess={() => setTwiceReview(false)}
                                onClose={() => setTwiceReview(false)}
                            />
                        )}
                        {addReviewModal && (
                            <CreateReviewModal
                                onSend={(D: any, R: any) => sendReview(D, R)}
                                onClose={() => setAddReviewModal(false)}
                            />
                        )}
                        {comments.length !== 0 && (
                            <Button
                                className="product-page__main__reviews__title__action"
                                title="Оставить отзыв"
                                variant="text"
                                onClick={() => {
                                    if (userStore.value.login) {
                                        setAddReviewModal(true);
                                    } else {
                                        setShowNotAuthAlert(true);
                                    }
                                }}
                            />
                        )}
                    </div>
                    <div className="product-page__main__reviews__content">
                        {comments.length === 0 ? (
                            <div
                                style={{
                                    display: "flex",
                                    columnGap: "8px",
                                    alignItems: "center",
                                }}
                            >
                                <span>
                                    Будьте первым, кто оставит отзыв на этот
                                    товар!
                                </span>
                                <Button
                                    variant="text"
                                    title="Оставить отзыв"
                                    size="s"
                                    className="product-page__main__reviews__content__add-product"
                                    onClick={() => {
                                        if (userStore.value.login) {
                                            setAddReviewModal(true);
                                        } else {
                                            setShowNotAuthAlert(true);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            (showComments
                                ? comments
                                : comments.slice(0, 3)
                            ).map((comment: any, index: number) => (
                                <div
                                    key={comment.id ?? index}
                                    className="product-page__main__reviews__content__comment"
                                >
                                    <div className="product-page__main__reviews__content__comment__info">
                                        <span className="product-page__main__reviews__content__comment__info__avatar">
                                            <img
                                                className="product-page__main__reviews__content__comment__info__avatar__img"
                                                src={
                                                    comment.imageURL ??
                                                    ProfileIcon
                                                }
                                            />
                                        </span>
                                        <span className="product-page__main__reviews__content__comment__info__author">
                                            {comment.name}
                                        </span>
                                        <span className="product-page__main__reviews__content__comment__info__review">
                                            <span className="product-page__main__reviews__content__comment__info__review__rating">
                                                {Array(5)
                                                    .fill(0)
                                                    .map((_, I) => (
                                                        <img
                                                            key={I}
                                                            className="product-page__main__reviews__content__comment__info__review__rating__star"
                                                            src={
                                                                comment.rating >
                                                                I
                                                                    ? StarFilledIcon
                                                                    : StarIcon
                                                            }
                                                        />
                                                    ))}
                                            </span>
                                            <span className="product-page__main__reviews__content__comment__info__review__value">
                                                {comment.rating}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="product-page__main__reviews__content__comment__description">
                                        {comment.comment}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {showComments ? (
                        <InfinityList
                            onShow={() => fetchReviews(productId as string)}
                        />
                    ) : (
                        comments.length > 3 && (
                            <Button
                                variant="text"
                                title="Показать все комментарии"
                                className="product-page__main__reviews__content__more"
                                onClick={() => setShowComments(true)}
                            />
                        )
                    )}
                </div>
                {recommendations.length > 0 && (
                    <h2>Возможно, Вам понравится</h2>
                )}
                <div className="product-page__main__recommendations">
                    {recommendations.map((item: any) => (
                        <ProductCard
                            key={item.id}
                            id={`${item.id}`}
                            inCart={item.isInCart}
                            price={item.price}
                            discountPrice={item.discountPrice}
                            title={`${item.name}`}
                            rating={item.rating}
                            reviewsCount={item.reviewsCount}
                            mainImageAlt={`Изображение товара ${item.name}`}
                            mainImageSrc={item.image}
                            onError={(err) => {
                                if (err === AJAXErrors.Unauthorized) {
                                    setShowNotAuthAlertCart(true);
                                }
                            }}
                        />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ProductPage;
