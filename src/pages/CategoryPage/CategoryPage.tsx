import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { AJAXErrors } from "../../api/errors";
import { getBasket } from "../../api/basket";
import {
    getCategory,
    getSearchCategoryByFilters,
} from "../../api/categories";
import ProductCard from "../../components/ProductCard/ProductCard";

import Alert from "../../components/Alert/Alert";
import TextField from "../../components/TextField/TextField";
import Button from "../../components/Button/Button";
import Select from "../../components/Select/Select";

import SearchIcon from "../../shared/images/search-ico.svg";
import StarIcon from "../../shared/images/star-ico.svg";
import StarFilledIcon from "../../shared/images/star-filled-ico.svg";

import "./styles.scss";
import InfinityList from "../../components/InfinityList/InfinityList";

interface CategoryFilters {
    starsHover: number;
    minRating: number | string;
    minPrice: string;
    maxPrice: string;
    sortType: string;
}

function CategoryPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const [category, setCategory] = useState<any>({ id, name: undefined });
    const [products, setProducts] = useState<any[]>([]);
    const [showNotAuthAlert, setShowNotAuthAlert] = useState(false);

    const [searchString, setSearchString] = useState(
        searchParams.get("r") ?? "",
    );
    const [showFilters, setShowFilters] = useState(!!searchParams.get("s"));
    const [filters, setFilters] = useState<CategoryFilters>({
        starsHover: 0,
        minRating: searchParams.get("rt") ?? 0,
        minPrice: searchParams.get("l") ?? "",
        maxPrice: searchParams.get("h") ?? "",
        sortType: searchParams.get("s") ?? "default",
    });

    const productsRef = useRef(products);
    productsRef.current = products;
    const searchStringRef = useRef(searchString);
    searchStringRef.current = searchString;
    const filtersRef = useRef(filters);
    filtersRef.current = filters;
    const showFiltersRef = useRef(showFilters);
    showFiltersRef.current = showFilters;
    const fetchingRef = useRef(false);

    async function fetchCategory(categoryId: string) {
        const categories = await getCategory(categoryId);
        if (categories.code === AJAXErrors.NoError) {
            setCategory(categories.subcategory);
        }
    }

    function updateFilter(patch: Partial<CategoryFilters>) {
        const next = { ...filtersRef.current, ...patch };
        filtersRef.current = next;
        setFilters(next);
    }

    function handleSearch() {
        productsRef.current = [];
        setProducts([]);
        const request: Record<string, string> = {
            r: searchStringRef.current,
        };
        if (showFiltersRef.current) {
            if (filtersRef.current.minRating)
                request.rt = `${filtersRef.current.minRating}`;
            if (filtersRef.current.minPrice)
                request.l = filtersRef.current.minPrice;
            if (filtersRef.current.maxPrice)
                request.h = filtersRef.current.maxPrice;
            if (filtersRef.current.sortType)
                request.s = filtersRef.current.sortType;
        }
        navigate({
            pathname: `/category/${id}`,
            search: `?${new URLSearchParams(request).toString()}`,
        });
        fetchSearchResult(id as string);
    }

    async function fetchSearchResult(categoryId: string) {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        const { code, products: newProducts } =
            await getSearchCategoryByFilters(
                productsRef.current.length,
                categoryId,
                searchStringRef.current,
                showFiltersRef.current
                    ? (filtersRef.current as any)
                    : ({} as any),
            );
        const basketResponse = await getBasket();
        if (code === AJAXErrors.NoError) {
            const basket = new Set();
            if (basketResponse.code === AJAXErrors.NoError) {
                basketResponse.data!.products.forEach((item) =>
                    basket.add(item.productId),
                );
            }

            const merged = [
                ...productsRef.current,
                ...(newProducts ?? []).map((item: any) => ({
                    ...item,
                    isInCart: basket.has(item.id),
                })),
            ];
            productsRef.current = merged;
            setProducts(merged);
            fetchingRef.current = false;
        } else {
            fetchingRef.current = false;
        }
    }

    useEffect(() => {
        if (!id) return;
        setCategory({ id, name: undefined });

        const r = searchParams.get("r") ?? "";
        const s = searchParams.get("s") ?? "";
        const nextFilters: CategoryFilters = {
            starsHover: 0,
            minRating: searchParams.get("rt") ?? 0,
            minPrice: searchParams.get("l") ?? "",
            maxPrice: searchParams.get("h") ?? "",
            sortType: s || "default",
        };

        setSearchString(r);
        setShowFilters(!!s);
        setFilters(nextFilters);
        searchStringRef.current = r;
        showFiltersRef.current = !!s;
        filtersRef.current = nextFilters;

        productsRef.current = [];
        setProducts([]);

        fetchCategory(id);
        fetchSearchResult(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const urlSearchString = searchParams.get("r") ?? "";
    const sortType = searchParams.get("s") ?? "default";
    const minPrice = searchParams.get("l") ?? "";
    const maxPrice = searchParams.get("h") ?? "";

    return (
        <div className="container">
            <Header />
            <main className="category-page category-page_flex category-page_flex_column">
                {showNotAuthAlert && (
                    <Alert
                        title="Необходимо войти"
                        content="Для добавления товаров в корзину, надо сначала войти в профиль"
                        successButtonTitle="Войти"
                        onSuccess={() => navigate("/signin")}
                        onClose={() => setShowNotAuthAlert(false)}
                    />
                )}
                <h1 className="category-page__main-h1">{category.name}</h1>
                <div className="category-page__search">
                    <div className="category-page__search__field tf-button">
                        <TextField
                            className="tf-button__tf"
                            value={urlSearchString}
                            onChange={(ev: any) =>
                                setSearchString(ev.target.value)
                            }
                            onEnter={() => handleSearch()}
                        />
                        <Button
                            className="tf-button__btn"
                            iconSrc={SearchIcon}
                            onClick={() => handleSearch()}
                        />
                    </div>
                    <Button
                        className="category-page__search__btn success-button"
                        title={
                            showFilters
                                ? "Убрать фильтры"
                                : "Показать фильтры"
                        }
                        onClick={() => {
                            const next = !showFilters;
                            showFiltersRef.current = next;
                            setShowFilters(next);
                            if (next) {
                                handleSearch();
                            }
                        }}
                    />
                </div>
                {showFilters && (
                    <div className="category-page__filters">
                        <div>
                            <div className="category-page__filters__sort-title">
                                Сортировать:
                            </div>
                            <Select
                                defaultValue={sortType}
                                onSelect={(k) => updateFilter({ sortType: k })}
                                options={[
                                    {
                                        key: "default",
                                        name: "Не сортировать",
                                    },
                                    {
                                        key: "price_asc",
                                        name: "Сначала дешёвые",
                                    },
                                    {
                                        key: "price_desc",
                                        name: "Сначала дорогие",
                                    },
                                    {
                                        key: "rating_asc",
                                        name: "Сначала с низким рейтингом",
                                    },
                                    {
                                        key: "rating_desc",
                                        name: "Сначала c высоким рейтингом",
                                    },
                                ]}
                            />
                        </div>

                        <div className="category-page__filters__sep" />

                        <div>
                            <div className="category-page__filters__min-price-title">
                                Цена от
                            </div>
                            <TextField
                                type="number"
                                title="0"
                                className="category-page__filters__min-price"
                                maxLength={7}
                                value={minPrice}
                                min={0}
                                onChange={(ev: any) =>
                                    updateFilter({
                                        minPrice: ev.target.value,
                                    })
                                }
                            />
                            <div className="category-page__filters__max-price-title">
                                до
                            </div>
                            <TextField
                                type="number"
                                title="&#8734;"
                                className="category-page__filters__max-price"
                                maxLength={7}
                                min={0}
                                value={maxPrice}
                                onChange={(ev: any) =>
                                    updateFilter({
                                        maxPrice: ev.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="category-page__filters__sep" />

                        <div>
                            <div className="category-page__filters__rating-title">
                                Рейтинг от
                            </div>
                            <div className="category-page__filters__rating-value">
                                {Array(5)
                                    .fill(0)
                                    .map((_, I) => (
                                        <img
                                            key={I}
                                            className={
                                                filters.starsHover !== 0 &&
                                                filters.starsHover <= I &&
                                                filters.minRating > I
                                                    ? "review-modal__content__form__rating__value__star removed"
                                                    : "review-modal__content__form__rating__value__star"
                                            }
                                            src={
                                                filters.starsHover > I ||
                                                filters.minRating > I
                                                    ? StarFilledIcon
                                                    : StarIcon
                                            }
                                            onMouseOver={() =>
                                                updateFilter({
                                                    starsHover: I + 1,
                                                })
                                            }
                                            onMouseLeave={() =>
                                                updateFilter({
                                                    starsHover: 0,
                                                })
                                            }
                                            onClick={() =>
                                                updateFilter({
                                                    minRating:
                                                        filters.starsHover,
                                                })
                                            }
                                        />
                                    ))}
                            </div>
                        </div>

                        <Button
                            className="category-page__filters__apply-btn"
                            title="Применить"
                            onClick={() => handleSearch()}
                        />
                    </div>
                )}
                <hr className="category-page__sep" />
                {products.length === 0 &&
                    "По вашему запросу не удалось найти товары :<("}
                <div className="category-page__cards-container">
                    {products.map((item: any) => (
                        <ProductCard
                            key={item.id}
                            id={`${item.id}`}
                            inCart={item.isInCart}
                            price={item.price}
                            discountPrice={item.discount_price}
                            title={`${item.name}`}
                            rating={item.rating}
                            reviewsCount={item.reviews_count}
                            mainImageAlt={`Изображение товара ${item.name}`}
                            mainImageSrc={item.image}
                            onError={(err: any) => {
                                if (err === AJAXErrors.Unauthorized) {
                                    setShowNotAuthAlert(true);
                                }
                            }}
                        />
                    ))}
                </div>
                <InfinityList
                    onShow={() => fetchSearchResult(id as string)}
                />
            </main>
            <Footer />
        </div>
    );
}

export default CategoryPage;
