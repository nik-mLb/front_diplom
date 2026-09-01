import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";

import "./styles.scss";
import { getProducts } from "../../api/product";
import { getPersonalRecommendations } from "../../api/recommendation";
import { getBasket } from "../../api/basket";
import { AJAXErrors } from "../../api/errors";
import Alert from "../../components/Alert/Alert";
import InfinityList from "../../components/InfinityList/InfinityList";
import AdBanner from "../../components/AdBanner/AdBanner";

function applyAd(newProducts: any[]) {
    return newProducts;
}

function IndexPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([{ end: true }]);
    const [showNotAuthAlert, setShowNotAuthAlert] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [recPersonalized, setRecPersonalized] = useState(false);

    const fetchingRef = useRef(false);
    const basketPromiseRef = useRef<Promise<Set<string>> | null>(null);
    const offsetRef = useRef(0);
    const productsRef = useRef(products);
    productsRef.current = products;

    // Корзину грузим один раз за монтирование и переиспользуем промис: иначе
    // блок рекомендаций (один запрос) успевает отрисоваться раньше, чем товары
    // (два последовательных), и получает пустую корзину.
    function loadBasket(): Promise<Set<string>> {
        if (!basketPromiseRef.current) {
            basketPromiseRef.current = (async () => {
                const ids = new Set<string>();
                const basketResponse = await getBasket();
                if (basketResponse.code === AJAXErrors.NoError) {
                    basketResponse.data!.products.forEach((item) => {
                        ids.add(item.productId);
                    });
                }
                return ids;
            })();
        }
        return basketPromiseRef.current;
    }

    async function fetchProducts() {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        const [productsResponse, basket] = await Promise.all([
            getProducts(offsetRef.current),
            loadBasket(),
        ]);

        if (productsResponse.code === AJAXErrors.NoError) {
            const newProducts = productsResponse.products ?? [];
            const current = productsRef.current;
            const nextProducts = [
                ...current.slice(0, current.length - 1),
                ...applyAd(
                    newProducts.map((item) => ({
                        id: item.id,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        discountPrice: item.discountPrice,
                        reviewsCount: item.reviewsCount,
                        rating: item.rating,
                        isInCart: basket.has(item.id),
                    })),
                ),
                { end: true },
            ];
            productsRef.current = nextProducts;
            setProducts(nextProducts);
            offsetRef.current += newProducts.length;
            fetchingRef.current = false;
        } else {
            fetchingRef.current = false;
        }
    }

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        (async () => {
            const [{ code, products, personalized }, basket] =
                await Promise.all([getPersonalRecommendations(), loadBasket()]);
            if (code === AJAXErrors.NoError && products) {
                setRecPersonalized(!!personalized);
                setRecommendations(
                    products.map((item) => ({
                        ...item,
                        isInCart: basket.has(item.id),
                    })),
                );
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="container">
            <Header />
            <main className="index-page index-page_flex index-page_flex_column">
                {showNotAuthAlert && (
                    <Alert
                        title="Необходимо войти"
                        content="Для добавления товаров в корзину, надо сначала войти в профиль"
                        successButtonTitle="Войти"
                        onSuccess={() => navigate("/signin")}
                        onClose={() => setShowNotAuthAlert(false)}
                    />
                )}
                {recommendations.length > 0 && (
                    <>
                        <h1 className="index-page__main-h1">
                            {recPersonalized
                                ? "Рекомендуем вам"
                                : "Популярное"}
                        </h1>
                        <div className="index-page__cards-container">
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
                                            setShowNotAuthAlert(true);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
                <h1 className="index-page__main-h1">Хиты продаж</h1>
                <div className="index-page__cards-container">
                    {products.map((item: any, index: number) =>
                        !item.ad && !item.end ? (
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
                                        setShowNotAuthAlert(true);
                                    }
                                }}
                            />
                        ) : item.ad ? (
                            <AdBanner key={index} url={item.url} />
                        ) : (
                            <InfinityList
                                key="infinity"
                                onShow={() => fetchProducts()}
                            />
                        ),
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default IndexPage;
