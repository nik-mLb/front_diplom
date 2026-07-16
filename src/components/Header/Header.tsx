import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import Button, {
    BUTTON_SIZE,
    BUTTON_VARIANT,
    ICON_POSITION,
} from "../Button/Button";
import TextField, { TEXTFIELD_TYPES } from "../TextField/TextField";

import "./styles.scss";

import LogoFull from "../../shared/images/LogoFull.svg";
import CatalogButtonIcon from "../../shared/images/catalog-button-ico.svg";

import HeaderOrders from "../../shared/images/header-orders-ico.svg";
import HeaderOrdersHover from "../../shared/images/header-orders-ico-hover.svg";

import HeaderCart from "../../shared/images/header-cart-ico.svg";
import HeaderCartHover from "../../shared/images/header-cart-ico-hover.svg";

import HeaderProfile from "../../shared/images/header-profile-ico.svg";
import HeaderProfileHover from "../../shared/images/header-profile-ico-hover.svg";

import ToolIcon from "../../shared/images/tool-ico.svg";
import ToolIconHover from "../../shared/images/tool-ico-hover.svg";

import BellIcon from "../../shared/images/bell-ico.svg";
import BellIconHover from "../../shared/images/bell-ico-hover.svg";

import MenuIcon from "../../shared/images/menu.svg";
import CrossIcon from "../../shared/images/cross-ico.svg";

import SearchIcon from "../../shared/images/search-ico-gray.svg";

import HeaderLogin from "../../shared/images/header-profile-enter-ico.svg";
import HeaderLoginHover from "../../shared/images/header-profile-enter-ico-hover.svg";
import { AJAXErrors } from "../../api/errors";
import { getSearchResult } from "../../api/product";
import { useUserStore } from "../../stores/UserStore";
import { useProductsStore } from "../../stores/ProductsStore";

function Header() {
    const navigate = useNavigate();
    const userStore = useUserStore();
    const productsStore = useProductsStore();

    const authorized = !!userStore.value.login;
    const role = userStore.value.role;

    const [ordersIcon, setOrdersIcon] = useState(HeaderOrders);
    const [cartIcon, setCartIcon] = useState(HeaderCart);
    const [iconIcon, setIconIcon] = useState(ToolIcon);
    const [bellIcon, setBellIcon] = useState(BellIcon);
    const [profileIcon, setProfileIcon] = useState(
        authorized ? HeaderProfile : HeaderLogin,
    );

    const [popUpDisplayed, setPopUpDisplayed] = useState(false);
    const [menuOpened, setMenuOpened] = useState(false);
    const [searchMenuOpened, setSearchMenuOpened] = useState(false);
    const [searchResult, setSearchResult] = useState<any>(null);
    const [searchValue, setSearchValue] = useState("");
    const [categories, setCategories] = useState<any[] | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [subcategories, setSubcategories] = useState<any[] | null>(null);
    const [showSearchMobile, setShowSearchMobile] = useState(false);
    const [mode, setMode] = useState("comp");

    useEffect(() => {
        setProfileIcon(authorized ? HeaderProfile : HeaderLogin);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authorized]);

    useEffect(() => {
        (async () => {
            const cats = await productsStore.getCategories();
            setCategories(cats.slice(0, 6));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchSubcategories(category: any) {
        const data = await productsStore.getSubCategories(category.id);
        setSubcategories(data);
        setSelectedCategory(category);
    }

    async function fetchSearchResult(ev: ChangeEvent<HTMLInputElement>) {
        const value = ev.target.value;
        const { code, data } = await getSearchResult(value);
        if (code === AJAXErrors.NoError) {
            setSearchResult(data);
            setSearchValue(value);
            setShowSearchMobile(mode === "phone");
            setSearchMenuOpened(mode !== "phone");
        }
    }

    function openProduct(product: any) {
        setShowSearchMobile(false);
        setSearchMenuOpened(false);
        navigate({
            pathname: "/search",
            search: `?r=${encodeURIComponent(product.name)}`,
        });
    }

    const searchModal = (searchResult: any) => (
        <div className="header__nav__row_main__search-field-wrapper__body__modal">
            <div
                className="header__nav__row_main__search-field-wrapper__body__modal_tint"
                onClick={() => setSearchMenuOpened(false)}
            />
            <div className="header__nav__row_main__search-field-wrapper__body__modal_content">
                {searchResult.products && (
                    <div className="header__nav__row_main__search-field-wrapper__body__modal_content__item">
                        {searchValue !== "" && <h3>Найденные товары</h3>}
                        {searchValue === "" ? (
                            <div style={{ fontStyle: "italic" }}>
                                Введите что-нибудь для поиска товаров
                            </div>
                        ) : (
                            <ul>
                                {searchResult.products
                                    .slice(0, 5)
                                    .map((e: any) => (
                                        <li
                                            key={e.id}
                                            onClick={() => openProduct(e)}
                                        >
                                            {e.name}
                                        </li>
                                    ))}
                            </ul>
                        )}
                        {searchResult.products.length > 3 &&
                            searchValue !== "" && (
                                <Button
                                    className="header__nav__row_main__search-field-wrapper__body__modal_content__item__link"
                                    title={`Все найденные товары (${searchResult.products.length})`}
                                    size="m"
                                    variant="text"
                                    onClick={() => {
                                        setShowSearchMobile(false);
                                        setSearchMenuOpened(false);
                                        navigate({
                                            pathname: "/search",
                                            search: `?r=${encodeURIComponent(searchValue)}`,
                                        });
                                    }}
                                />
                            )}
                    </div>
                )}
                {!searchResult.categories &&
                    !searchResult.products &&
                    "Ничего не удалось найти"}
            </div>
        </div>
    );

    return (
        <header className="header header_light">
            <div className="header__nav">
                <div className="header__nav__row header__nav__row_main">
                    {!showSearchMobile ? (
                        <img
                            className="header__nav__logo"
                            alt="Логотип маркетплейса Bazaar"
                            src={`${LogoFull}`}
                            onClick={() => {
                                if (location.pathname === "/") {
                                    window.scroll({
                                        top: 0,
                                        behavior: "smooth",
                                    });
                                } else {
                                    navigate("/");
                                }
                            }}
                        />
                    ) : (
                        <TextField
                            className="header__nav__tf"
                            type={`${TEXTFIELD_TYPES.SEARCH}`}
                            title="Введите"
                            onChange={(ev) => fetchSearchResult(ev)}
                            onFocus={() => {
                                setSearchMenuOpened(true);
                                setMode("phone");
                                setSelectedCategory(null);
                            }}
                            onKeyEnter={() => {
                                setShowSearchMobile(false);
                                setSearchMenuOpened(false);
                                navigate({
                                    pathname: "/search",
                                    search: `?r=${encodeURIComponent(searchValue)}`,
                                });
                            }}
                            onEnd={() => {
                                if (searchValue === "") {
                                    setSearchMenuOpened(false);
                                } else {
                                    navigate({
                                        pathname: "/search",
                                        search: `?r=${encodeURIComponent(searchValue)}`,
                                    });
                                }
                            }}
                        />
                    )}

                    {showSearchMobile &&
                        searchResult &&
                        searchModal(searchResult)}

                    <div className="header__nav__row_main__search-field-wrapper">
                        <Button
                            size={BUTTON_SIZE.L}
                            title="Каталог"
                            iconSrc={`${CatalogButtonIcon}`}
                            iconAlt="Иконка каталога"
                            onClick={() => setPopUpDisplayed(!popUpDisplayed)}
                        />

                        <div className="header__nav__row_main__search-field-wrapper__body">
                            <TextField
                                type={`${TEXTFIELD_TYPES.SEARCH}`}
                                title="Ищите что угодно на Bazaar"
                                className="width header__nav__row_main__search-field-wrapper__body__field"
                                onChange={(ev) => fetchSearchResult(ev)}
                                onFocus={() => {
                                    setMode("comp");
                                    setSearchMenuOpened(true);
                                    setSelectedCategory(null);
                                }}
                                onEnd={() => {
                                    if (searchValue === "") {
                                        setSearchMenuOpened(false);
                                    }
                                }}
                                onKeyEnter={() => {
                                    setShowSearchMobile(false);
                                    setSearchMenuOpened(false);
                                    navigate({
                                        pathname: "/search",
                                        search: `?r=${encodeURIComponent(searchValue)}`,
                                    });
                                }}
                            />
                            {searchMenuOpened &&
                                searchResult &&
                                searchModal(searchResult)}
                        </div>
                    </div>

                    <div className="header__nav__row_main__icons-wrapper">
                        {authorized &&
                            (role === "admin" ||
                                role === "seller" ||
                                role === "warehouseman") && (
                                <Button
                                    size={`${BUTTON_SIZE.L}`}
                                    iconPosition={`${ICON_POSITION.TOP}`}
                                    variant={`${BUTTON_VARIANT.TRANSPARENT}`}
                                    title={
                                        role === "seller"
                                            ? "Продажа"
                                            : "Консоль"
                                    }
                                    iconSrc={`${iconIcon}`}
                                    iconAlt="Иконка сердечко"
                                    onMouseOver={() =>
                                        setIconIcon(ToolIconHover)
                                    }
                                    onMouseLeave={() => setIconIcon(ToolIcon)}
                                    onClick={() => {
                                        switch (role) {
                                            case "admin":
                                                navigate("/admin");
                                                break;
                                            case "seller":
                                                navigate("/seller");
                                                break;
                                            case "warehouseman":
                                                navigate("/warehouse");
                                                break;
                                        }
                                    }}
                                />
                            )}
                        {authorized && (
                            <Button
                                size={`${BUTTON_SIZE.L}`}
                                iconPosition={`${ICON_POSITION.TOP}`}
                                variant={`${BUTTON_VARIANT.TRANSPARENT}`}
                                title="Уведомления"
                                iconSrc={`${bellIcon}`}
                                iconAlt="Уведомления"
                                badgeTitle={userStore.value.unread_count || ""}
                                onMouseOver={() => setBellIcon(BellIconHover)}
                                onMouseLeave={() => setBellIcon(BellIcon)}
                                onClick={() => navigate("/notifications")}
                            />
                        )}
                        {authorized && (
                            <Button
                                size={`${BUTTON_SIZE.L}`}
                                iconPosition={`${ICON_POSITION.TOP}`}
                                variant={`${BUTTON_VARIANT.TRANSPARENT}`}
                                title="Заказы"
                                iconSrc={`${ordersIcon}`}
                                iconAlt="Иконка заказов"
                                onMouseOver={() =>
                                    setOrdersIcon(HeaderOrdersHover)
                                }
                                onMouseLeave={() =>
                                    setOrdersIcon(HeaderOrders)
                                }
                                onClick={() => navigate("/orders")}
                            />
                        )}
                        <Button
                            size={`${BUTTON_SIZE.L}`}
                            iconPosition={`${ICON_POSITION.TOP}`}
                            variant={`${BUTTON_VARIANT.TRANSPARENT}`}
                            title="Корзина"
                            iconSrc={`${cartIcon}`}
                            iconAlt="Иконка корзины"
                            onMouseOver={() => setCartIcon(HeaderCartHover)}
                            onMouseLeave={() => setCartIcon(HeaderCart)}
                            onClick={() => navigate("/cart")}
                        />

                        <Button
                            size={`${BUTTON_SIZE.L}`}
                            iconPosition={`${ICON_POSITION.TOP}`}
                            variant={`${BUTTON_VARIANT.TRANSPARENT}`}
                            title={authorized ? "Профиль" : "Войти"}
                            iconSrc={`${profileIcon}`}
                            iconAlt="Иконка профиля"
                            onMouseOver={() => {
                                setProfileIcon(
                                    authorized
                                        ? HeaderProfileHover
                                        : HeaderLoginHover,
                                );
                            }}
                            onMouseLeave={() => {
                                setProfileIcon(
                                    authorized ? HeaderProfile : HeaderLogin,
                                );
                            }}
                            onClick={() => {
                                navigate(authorized ? "/profile" : "/signin");
                            }}
                        />
                    </div>

                    <div className="header__nav__row_main__icons-wrapper__phone">
                        <img
                            className="header__nav__row_main__icons-wrapper__phone__button s"
                            src={SearchIcon}
                            onClick={() => {
                                setShowSearchMobile(!showSearchMobile);
                                setMode("phone");
                            }}
                        />
                        <img
                            className="header__nav__row_main__icons-wrapper__phone__button"
                            src={MenuIcon}
                            onClick={() => setMenuOpened(true)}
                        />
                    </div>

                    <div
                        className={`menu-modal${menuOpened ? " opened" : ""}`}
                    >
                        <div className="menu-modal__tint"></div>
                        <div className="menu-modal__content">
                            <div className="menu-modal__content__padding">
                                <div className="menu-modal__content__title">
                                    <img
                                        className="header__nav__row_main__icons-wrapper__phone__button"
                                        src={CrossIcon}
                                        onClick={() => setMenuOpened(false)}
                                    />
                                    <span className="menu-modal__content__title__text">
                                        Меню
                                    </span>
                                </div>
                                <Button
                                    title="Поиск"
                                    iconSrc={SearchIcon}
                                    variant="text"
                                    className="menu-modal__content__button"
                                    onClick={() => {
                                        setMenuOpened(false);
                                        navigate("/search?r=");
                                    }}
                                />
                                {authorized && (
                                    <Button
                                        title="Уведомления"
                                        badgeTitle={
                                            userStore.value.unread_count || ""
                                        }
                                        iconSrc={BellIcon}
                                        variant="text"
                                        className="menu-modal__content__button"
                                        onClick={() =>
                                            navigate("/notifications")
                                        }
                                    />
                                )}
                                <Button
                                    title={authorized ? "Профиль" : "Войти"}
                                    iconSrc={
                                        authorized
                                            ? HeaderProfile
                                            : HeaderLogin
                                    }
                                    variant="text"
                                    className="menu-modal__content__button"
                                    onClick={() => {
                                        setMenuOpened(false);
                                        navigate("/profile");
                                    }}
                                />
                                {authorized && (
                                    <Button
                                        title="Корзина"
                                        iconSrc={HeaderCart}
                                        variant="text"
                                        className="menu-modal__content__button"
                                        onClick={() => {
                                            setMenuOpened(false);
                                            navigate("/cart");
                                        }}
                                    />
                                )}
                                {authorized && (
                                    <Button
                                        title="Заказы"
                                        iconSrc={HeaderOrders}
                                        variant="text"
                                        className="menu-modal__content__button"
                                        onClick={() => {
                                            setMenuOpened(false);
                                            navigate("/orders");
                                        }}
                                    />
                                )}
                                {authorized &&
                                    (role === "admin" ||
                                        role === "seller" ||
                                        role === "warehouseman") && (
                                        <Button
                                            title={
                                                role === "seller"
                                                    ? "Продажа"
                                                    : "Консоль"
                                            }
                                            variant="text"
                                            className="menu-modal__content__button"
                                            iconSrc={ToolIcon}
                                            onClick={() => {
                                                switch (role) {
                                                    case "admin":
                                                        navigate("/admin");
                                                        break;
                                                    case "seller":
                                                        navigate("/seller");
                                                        break;
                                                    case "warehouseman":
                                                        navigate(
                                                            "/warehouse",
                                                        );
                                                        break;
                                                }
                                            }}
                                        />
                                    )}
                                {role === "buyer" && (
                                    <Button
                                        title="Хочу&#160;стать&#160;продавцом!"
                                        variant="text"
                                        className="bottom-button"
                                        onClick={() =>
                                            navigate("/seller-form")
                                        }
                                    />
                                )}
                                {role === "pending" && (
                                    <div className="header__nav__secondary__seller-pending">
                                        Заявка&#160;на&#160;продавца&#160;отправлена
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`header__nav__secondary${popUpDisplayed ? " hidden" : ""}`}
                >
                    <div className="categories-wrapper">
                        {categories &&
                            categories.map((category: any) => (
                                <div
                                    key={category.id}
                                    onMouseLeave={() =>
                                        setSelectedCategory(null)
                                    }
                                >
                                    <span
                                        className="categories-wrapper__item"
                                        onMouseOver={() => {
                                            if (
                                                !selectedCategory ||
                                                category.id !==
                                                    selectedCategory.id
                                            ) {
                                                fetchSubcategories(category);
                                            }
                                        }}
                                    >
                                        <span className="categories-wrapper__item__value">
                                            {category.name}
                                        </span>
                                        {selectedCategory?.id ===
                                            category.id && (
                                            <div className="subcategories-modal">
                                                <div className="subcategories-modal__items">
                                                    {subcategories?.map(
                                                        (E: any) => (
                                                            <span
                                                                key={E.id}
                                                                className="subcategories-modal__items__item"
                                                                onClick={() => {
                                                                    setSelectedCategory(
                                                                        null,
                                                                    );
                                                                    navigate(
                                                                        "/category/" +
                                                                            E.id,
                                                                    );
                                                                }}
                                                            >
                                                                {E.name}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </span>
                                </div>
                            ))}
                    </div>
                    {role === "buyer" && (
                        <div
                            className="header__nav__secondary__seller"
                            onClick={() => navigate("/seller-form")}
                        >
                            Хочу стать продавцом!
                        </div>
                    )}
                    {role === "pending" && (
                        <div className="header__nav__secondary__seller-pending">
                            Заявка на продавца отправлена
                        </div>
                    )}
                </div>
            </div>

            <div
                className={`header__pop-up${popUpDisplayed ? " opened" : ""}`}
            >
                <div className="header__pop-up__list">
                    {categories &&
                        categories.map((item: any) => (
                            <Button
                                key={item.id}
                                title={`${item.name}`}
                                variant={`${BUTTON_VARIANT.TRANSPARENT}`}
                                className="header__pop-up__list__button"
                                onMouseOver={() => {
                                    if (
                                        !selectedCategory ||
                                        item.id !== selectedCategory.id
                                    ) {
                                        fetchSubcategories(item);
                                    }
                                }}
                            />
                        ))}
                </div>
                <div className="header__pop-up__info-wrapper">
                    <h2
                        id="category-h2"
                        className="h2-reset header__pop-up__info-wrapper__category-title"
                    >
                        {selectedCategory
                            ? selectedCategory.name
                            : "Выберите категорию"}
                    </h2>
                    <div className="header__pop-up__info-wrapper__list">
                        {subcategories &&
                            subcategories.map((e: any) => (
                                <Button
                                    key={e.id}
                                    title={`${e.name}`}
                                    variant={`${BUTTON_VARIANT.TRANSPARENT}`}
                                    onClick={() => {
                                        setPopUpDisplayed(false);
                                        navigate(`/category/${e.id}`);
                                    }}
                                    className="header__pop-up__info-wrapper__list__item"
                                />
                            ))}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
