import { useEffect, useRef, useState } from "react";
import SellerHeader from "../../components/SellerHeader/SellerHeader";
import Footer from "../../components/Footer/Footer";

import "./styles.scss";
import { Product } from "../../api/product";
import InfinityList from "../../components/InfinityList/InfinityList";
import {
    addProductImage,
    addProductInformation,
    getSellerProducts,
} from "../../api/seller";
import { AJAXErrors } from "../../api/errors";
import { convertMoney } from "../AdminPage/AdminPage";
import ProductModal, {
    type ProductModalHandle,
} from "../../components/ProductModal/ProductModal";
import Button from "../../components/Button/Button";
import TextField from "../../components/TextField/TextField";
import TextArea from "../../components/TextArea/TextArea";
import { ValidTypes } from "bazaar-validation";
import CategorySelect from "../../components/CategorySelect/CategorySelect";
import { useUserStore } from "../../stores/UserStore";

interface ProductForm {
    name: string;
    description: string;
    price: string;
    quantity: string;
    category: string;
    image: string | null;
    imageFile: File | null;
}

const EMPTY_PRODUCT_FORM: ProductForm = {
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    image: null,
    imageFile: null,
};

function SellerPage() {
    const userStore = useUserStore();
    const productModalRef = useRef<ProductModalHandle>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const productsRef = useRef<Product[]>(products);
    productsRef.current = products;
    const fetchingRef = useRef(false);

    const [addProduct, setAddProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [error, setError] = useState("");
    const [productForm, setProductForm] = useState<ProductForm>(
        EMPTY_PRODUCT_FORM,
    );

    async function fetchProducts() {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        const { code, products: newProducts } = await getSellerProducts(
            productsRef.current.length,
        );
        if (code === AJAXErrors.NoError) {
            setProducts([...productsRef.current, ...newProducts!]);
        }
        fetchingRef.current = false;
    }

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleUploadImage(ev: any) {
        const reader = new FileReader();
        reader.onload = () => {
            setProductForm((prev) => ({
                ...prev,
                image: reader.result as string,
                imageFile: ev.target.files[0],
            }));
        };
        reader.readAsDataURL(ev.target.files[0]);
    }

    async function handleSendProduct() {
        const form = productForm;
        if (Number.isInteger(form.price) && parseInt(form.price) > 0) {
            setError("Цена не может быть отрицательной");
            return;
        }

        if (Number.isInteger(form.quantity) && parseInt(form.quantity) > 0) {
            setError("Количество товаров не может быть отрицательной");
            return;
        }

        if (!form.name || !form.description || !form.image || !form.category) {
            setError(
                "Заполните все поля формы, выберите категорию и приложите фото",
            );
            return;
        }

        const { code, productId } = await addProductInformation({
            name: form.name,
            description: form.description,
            price: parseInt(form.price),
            quantity: parseInt(form.quantity),
            sellerId: userStore.value.id,
            category: form.category,
        });

        if (code === AJAXErrors.NoError) {
            const imageCode = await addProductImage(
                productId!,
                form.imageFile!,
            );
            if (imageCode === AJAXErrors.NoError) {
                setProducts([]);
                productsRef.current = [];
                fetchProducts();
                setAddProduct(false);
            }
        }
    }

    return (
        <div className="seller-page">
            <SellerHeader />
            <main className="seller-page__content">
                {!addProduct ? (
                    <div className="seller-page__content__products">
                        <div className="seller-page__content__products__title">
                            <h1 className="seller-page__content__products__title__h">
                                Товары на продаже
                            </h1>
                            <Button
                                title="Добавить товар"
                                onClick={() => setAddProduct(true)}
                            />
                        </div>

                        <table className="seller-page__content__products__table">
                            <thead>
                                <tr>
                                    <th width="25%">Название</th>
                                    <th width="35%">Описание</th>
                                    <th width="10%">Цена</th>
                                    <th width="10%">В наличии</th>
                                    <th width="10%">Статус</th>
                                    <th width="10%"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products !== null && products.length ? (
                                    products.map((product: Product) => (
                                        <tr key={product.id}>
                                            <td className="ellipsis">
                                                <span>{product.name}</span>
                                            </td>
                                            <td className="ellipsis">
                                                <span>
                                                    {product.description}
                                                </span>
                                            </td>
                                            <td style={{ maxWidth: "10%" }}>
                                                {convertMoney(product.price)}
                                            </td>
                                            <td style={{ maxWidth: "10%" }}>
                                                {product.quantity} шт
                                            </td>
                                            <td
                                                style={{ maxWidth: "10%" }}
                                                className={
                                                    "status " + product.status
                                                }
                                            >
                                                <span>
                                                    {
                                                        {
                                                            pending:
                                                                "Ожидание",
                                                            empty: "Закончился",
                                                            approved:
                                                                "В продаже",
                                                            rejected:
                                                                "Отказано",
                                                        }[
                                                            product.status as
                                                                | "pending"
                                                                | "empty"
                                                                | "approved"
                                                                | "rejected"
                                                        ]
                                                    }
                                                </span>
                                            </td>
                                            <td
                                                style={{ maxWidth: "10%" }}
                                                className="link"
                                                onClick={() => {
                                                    setSelectedProduct(
                                                        product,
                                                    );
                                                    productModalRef.current!.handleOpen();
                                                }}
                                            >
                                                Подробнее
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6}>
                                            Пока вы не выложили товар на
                                            продажу
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <ProductModal
                            ref={productModalRef}
                            product={selectedProduct}
                        />
                        <InfinityList onShow={() => fetchProducts()} />
                    </div>
                ) : (
                    <div className="seller-page__content__new-product">
                        <h1 className="seller-page__content__new-product__h">
                            Добавить товар
                        </h1>
                        <div className="seller-page__content__new-product__options">
                            <div className="seller-page__content__new-product__options__description">
                                <h3>Информация</h3>
                                <TextField
                                    title="Название"
                                    validType={ValidTypes.NotNullValid}
                                    onChange={(ev: any) =>
                                        setProductForm((prev) => ({
                                            ...prev,
                                            name: ev.target.value,
                                        }))
                                    }
                                />
                                <TextArea
                                    className="seller-page__content__new-product__options__description__desc"
                                    title="Описание"
                                    validType={ValidTypes.NotNullValid}
                                    onChange={(ev: any) =>
                                        setProductForm((prev) => ({
                                            ...prev,
                                            description: ev.target.value,
                                        }))
                                    }
                                />
                                <div className="seller-page__content__new-product__options__description__count">
                                    <TextField
                                        type="number"
                                        title="Цена товара"
                                        validType={ValidTypes.NotNullValid}
                                        onChange={(ev: any) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                price: ev.target.value,
                                            }))
                                        }
                                    />
                                    <TextField
                                        type="number"
                                        title="Доступное количество"
                                        validType={ValidTypes.NotNullValid}
                                        onChange={(ev: any) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                quantity: ev.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="seller-page__content__new-product__options__image">
                                <h3>Изображение</h3>
                                <label
                                    className="seller-page__content__new-product__options__image__ico"
                                    style={
                                        productForm.image
                                            ? { border: "none" }
                                            : undefined
                                    }
                                >
                                    <input
                                        type="file"
                                        accept=".jpg,.png"
                                        style={{ display: "none" }}
                                        onChange={(ev) =>
                                            handleUploadImage(ev)
                                        }
                                    />
                                    {productForm.image ? (
                                        <img
                                            className="seller-page__content__new-product__options__image__ico__img"
                                            src={productForm.image}
                                        />
                                    ) : (
                                        <div className="seller-page__content__new-product__options__image__ico__title">
                                            Загрузите
                                            <br />
                                            изображение
                                            <br />
                                            товара
                                        </div>
                                    )}
                                </label>
                                <CategorySelect
                                    className="seller-page__content__new-product__options__image__category"
                                    onSelect={(id) =>
                                        setProductForm((prev) => ({
                                            ...prev,
                                            category: id,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="seller-page__content__new-product__actions">
                            <Button
                                className="seller-page__content__new-product__actions__btn"
                                title="Выставить товар на продажу"
                                disabled={
                                    !productForm.name ||
                                    !productForm.description ||
                                    !productForm.price ||
                                    !productForm.quantity ||
                                    !productForm.image ||
                                    !productForm.category
                                }
                                onClick={() => handleSendProduct()}
                            />
                            <span className="seller-page__content__new-product__actions__error">
                                {error}
                            </span>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default SellerPage;
