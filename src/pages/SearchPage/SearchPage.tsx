import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import TextField from "../../components/TextField/TextField";
import Button from "../../components/Button/Button";
import Select from "../../components/Select/Select";

import SearchIcon from "../../shared/images/search-ico.svg";
import StarIcon from "../../shared/images/star-ico.svg";
import StarFilledIcon from "../../shared/images/star-filled-ico.svg";

import "./styles.scss";
import { getSearchResultByFilters } from "../../api/product";
import { AJAXErrors } from "../../api/errors";
import ProductCard from "../../components/ProductCard/ProductCard";
import InfinityList from "../../components/InfinityList/InfinityList";

interface SearchFilters {
    starsHover: number;
    minRating: number | string;
    minPrice: string;
    maxPrice: string;
    sortType: string;
}

function SearchPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [searchString, setSearchString] = useState(
        searchParams.get("r") ?? "",
    );
    const [showFilters, setShowFilters] = useState(!!searchParams.get("s"));
    const [filters, setFilters] = useState<SearchFilters>({
        starsHover: 0,
        minRating: searchParams.get("rt") ?? 0,
        minPrice: searchParams.get("l") ?? "",
        maxPrice: searchParams.get("h") ?? "",
        sortType: searchParams.get("s") ?? "default",
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const searchStringRef = useRef(searchString);
    searchStringRef.current = searchString;
    const filtersRef = useRef(filters);
    filtersRef.current = filters;
    const showFiltersRef = useRef(showFilters);
    showFiltersRef.current = showFilters;
    const productsRef = useRef(products);
    productsRef.current = products;
    const fetchingRef = useRef(false);

    function updateFilter(patch: Partial<SearchFilters>) {
        const next = { ...filtersRef.current, ...patch };
        filtersRef.current = next;
        setFilters(next);
    }

    function handleSearch() {
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
            pathname: "/search",
            search: `?${new URLSearchParams(request).toString()}`,
        });
    }

    async function fetchSearchResult() {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        const { code, data } = await getSearchResultByFilters(
            searchStringRef.current,
            0,
            showFiltersRef.current ? (filtersRef.current as any) : ({} as any),
        );
        if (code === AJAXErrors.NoError) {
            const newProducts = data!.products.products;
            productsRef.current = newProducts;
            setCategories(data!.categories.categories);
            setProducts(newProducts);
            fetchingRef.current = false;
        } else {
            fetchingRef.current = false;
        }
    }

    async function fetchNext() {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        const { code, data } = await getSearchResultByFilters(
            searchStringRef.current,
            productsRef.current.length,
            showFiltersRef.current ? (filtersRef.current as any) : ({} as any),
        );
        if (code === AJAXErrors.NoError) {
            const merged = [...productsRef.current, ...data!.products.products];
            productsRef.current = merged;
            setProducts(merged);
            fetchingRef.current = false;
        } else {
            fetchingRef.current = false;
        }
    }

    useEffect(() => {
        const r = searchParams.get("r");
        if (!r) {
            navigate("/");
            return;
        }
        const s = searchParams.get("s") ?? "";
        const nextFilters: SearchFilters = {
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

        setCategories([]);
        setProducts([]);
        productsRef.current = [];

        fetchSearchResult();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    const urlSearchString = searchParams.get("r") ?? "";
    const sortType = searchParams.get("s") ?? "default";
    const minPrice = searchParams.get("l") ?? "";
    const maxPrice = searchParams.get("h") ?? "";

    return (
        <div className="search-page">
            <Header />
            <main className="search-page__content">
                <div className="search-page__content__search">
                    <div className="search-page__content__search__field tf-button">
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
                        className="search-page__content__search__btn success-button"
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
                    <div className="search-page__content__filters">
                        <div>
                            <div className="search-page__content__filters__sort-title">
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

                        <div className="search-page__content__filters__sep" />

                        <div>
                            <div className="search-page__content__filters__min-price-title">
                                Цена от
                            </div>
                            <TextField
                                type="number"
                                title="0"
                                className="search-page__content__filters__min-price"
                                maxLength={7}
                                min={0}
                                value={minPrice}
                                onChange={(ev: any) =>
                                    updateFilter({
                                        minPrice: ev.target.value,
                                    })
                                }
                            />
                            <div className="search-page__content__filters__max-price-title">
                                до
                            </div>
                            <TextField
                                type="number"
                                title="&#8734;"
                                className="search-page__content__filters__max-price"
                                maxLength={7}
                                value={maxPrice}
                                min={0}
                                onChange={(ev: any) =>
                                    updateFilter({
                                        maxPrice: ev.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="search-page__content__filters__sep" />

                        <div>
                            <div className="search-page__content__filters__rating-title">
                                Рейтинг от
                            </div>
                            <div className="search-page__content__filters__rating-value">
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
                            className="search-page__content__filters__apply-btn"
                            title="Применить"
                            onClick={() => handleSearch()}
                        />
                    </div>
                )}
                <hr className="search-page__content__sep" />
                <div className="search-page__content__categories">
                    <h1 className="search-page__content__categories__h">
                        Найденные категории
                    </h1>
                    {categories.length > 0 ? (
                        <div className="search-page__content__categories__list">
                            {categories.map((C: any) => (
                                <Button
                                    key={C.id}
                                    className="search-page__content__categories__list__item"
                                    title={C.name}
                                    variant="text"
                                    onClick={() =>
                                        navigate(`/category/${C.id}`)
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        "По вашему запросу категории не найдены"
                    )}
                </div>
                <hr className="search-page__content__sep" />
                <div className="search-page__content__products">
                    <h1 className="search-page__content__products__h">
                        Найденные товары
                    </h1>
                    {products.length > 0 ? (
                        <div className="search-page__content__products__list">
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
                                    onError={() => {}}
                                />
                            ))}
                        </div>
                    ) : (
                        "По вашему запросу товары не найдены"
                    )}
                    {products.length > 0 && (
                        <InfinityList onShow={() => fetchNext()} />
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default SearchPage;
