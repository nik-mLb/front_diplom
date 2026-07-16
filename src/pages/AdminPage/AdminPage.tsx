import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader/AdminHeader";
import Footer from "../../components/Footer/Footer";

import "./styles.scss";
import UserRequestModal, {
    type UserRequestModalHandle,
} from "../../components/UserRequestModal/UserRequestModal";
import {
    createPromocode,
    getProductsRequests,
    getPromocodes,
    getUserRequests,
    ProductRequest,
    Promocode,
    sendProductRequestAnswer,
    sendUserRequestAnswer,
    UserRequest,
} from "../../api/admin";
import { AJAXErrors } from "../../api/errors";
import InfinityList from "../../components/InfinityList/InfinityList";
import ProductRequestModal, {
    type ProductRequestModalHandle,
} from "../../components/ProductRequestModal/ProductRequestModal";
import { getProduct, Product } from "../../api/product";
import Button from "../../components/Button/Button";
import PromocodeModal from "../../components/PromocodeModal/PromocodeModal";

export function convertMoney(rawData: string | number) {
    const data = rawData.toString();
    const result =
        data.length % 3 === 0 ? [] : [data.slice(0, data.length % 3)];
    for (let i = data.length % 3; i < data.length; i += 3) {
        result.push(data.slice(i, i + 3));
    }
    return result.join(" ") + " ₽";
}

function AdminPage() {
    const navigate = useNavigate();
    const { tab } = useParams<{ tab: string }>();

    const [tabOpened, setTabOpened] = useState("sellers");
    const [fetchDone, setFetchDone] = useState(false);

    const [sellers, setSellers] = useState<UserRequest[] | undefined>(
        undefined,
    );
    const sellersRef = useRef(sellers);
    sellersRef.current = sellers;
    const sellersFetchRef = useRef(false);
    const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(
        null,
    );
    const sellerInfoModalRef = useRef<UserRequestModalHandle>(null);

    const [products, setProducts] = useState<ProductRequest[] | undefined>(
        undefined,
    );
    const productsRef = useRef(products);
    productsRef.current = products;
    const productsFetchRef = useRef(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const productInfoModalRef = useRef<ProductRequestModalHandle>(null);

    const [createPromocodeOpened, setCreatePromocodeOpened] = useState(false);
    const [promocodes, setPromocodes] = useState<Promocode[] | null>(null);
    const promocodesRef = useRef(promocodes);
    promocodesRef.current = promocodes;
    const promocodesFetchRef = useRef(false);

    async function fetchUserRequests() {
        if (sellersFetchRef.current) return;
        sellersFetchRef.current = true;
        const { code, requests } = await getUserRequests(
            sellersRef.current?.length ?? 0,
        );
        if (code === AJAXErrors.NoError) {
            setSellers([...(sellersRef.current ?? []), ...requests!]);
        } else {
            navigate("/");
        }
        sellersFetchRef.current = false;
    }

    async function fetchProductsRequests() {
        if (productsFetchRef.current) return;
        productsFetchRef.current = true;
        const { code, requests } = await getProductsRequests(
            productsRef.current?.length ?? 0,
        );
        if (code === AJAXErrors.NoError) {
            setProducts([...(productsRef.current ?? []), ...requests!]);
        } else {
            navigate("/");
        }
        productsFetchRef.current = false;
    }

    async function fetchPromocodes(start: boolean = false) {
        if (promocodesFetchRef.current) return;
        promocodesFetchRef.current = true;
        const { code, data } = await getPromocodes(
            start ? 0 : (promocodesRef.current?.length ?? 0),
        );
        if (code === AJAXErrors.NoError) {
            setPromocodes(
                start ? data! : [...(promocodesRef.current ?? []), ...data!],
            );
        }
        promocodesFetchRef.current = false;
    }

    function fetchNextRequests() {
        if (tabOpened === "sellers") {
            fetchUserRequests();
        }
        if (tabOpened === "products") {
            fetchUserRequests();
        }
        if (tabOpened === "promocode") {
            fetchPromocodes(true);
        }
    }

    useEffect(() => {
        const newTab = tab ?? "sellers";
        if (newTab === "sellers" && !sellersRef.current) {
            fetchUserRequests();
        }
        if (newTab === "products" && !productsRef.current) {
            fetchProductsRequests();
        }
        if (newTab === "promocode" && !promocodesRef.current) {
            fetchPromocodes(true);
        }
        setTabOpened(newTab);
        setFetchDone(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    async function sendUserAnswer(accepted: boolean) {
        const code = await sendUserRequestAnswer(
            selectedRequest!.id,
            accepted,
        );
        if (code === AJAXErrors.NoError) {
            sellerInfoModalRef.current!.handleClose();
            setSellers(
                (sellersRef.current ?? []).filter(
                    (request) => request.id !== selectedRequest!.id,
                ),
            );
        }
    }

    async function sendProductAnswer(accepted: boolean) {
        const code = await sendProductRequestAnswer(
            selectedProduct!.id,
            accepted,
        );
        if (code === AJAXErrors.NoError) {
            productInfoModalRef.current!.handleClose();
            setProducts(
                (productsRef.current ?? []).filter(
                    (request) => request.id !== selectedProduct!.id,
                ),
            );
        }
    }

    async function handleShowProduct(request: ProductRequest) {
        const { code, product } = await getProduct(request.id);
        if (code === AJAXErrors.NoError) {
            setSelectedProduct(product!);
            productInfoModalRef.current!.handleOpen();
        }
    }

    async function handleCreatePromocode(form: {
        name: string;
        percent: string;
        start: Date;
        end: Date;
    }) {
        const code = await createPromocode(
            form.name,
            form.percent,
            form.start,
            form.end,
        );
        if (code === AJAXErrors.NoError) {
            setCreatePromocodeOpened(false);
            fetchPromocodes(true);
        }
    }

    return (
        <div className="admin-page">
            <AdminHeader />
            <main className="admin-page__content">
                <div
                    className="admin-page__content__sellers"
                    hidden={tabOpened !== "sellers"}
                >
                    <h1 className="admin-page__content__sellers__h">
                        Заявки продавцов
                    </h1>
                    <table className="admin-page__content__sellers__table">
                        <thead>
                            <tr>
                                <th width="15%">Название</th>
                                <th width="30%">Описание</th>
                                <th width="25%">Имя владельца</th>
                                <th width="20%">Email владельца</th>
                                <th width="10%"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellers && sellers.length ? (
                                sellers.map((request: UserRequest) => (
                                    <tr key={request.id}>
                                        <td>{request.sellerInfo.title}</td>
                                        <td>
                                            {request.sellerInfo.description}
                                        </td>
                                        <td>
                                            {`${request.surname ?? ""} ${request.name}`.trim()}
                                        </td>
                                        <td>{request.email}</td>
                                        <td
                                            className="link"
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                sellerInfoModalRef.current!.handleOpen();
                                            }}
                                        >
                                            Подробнее
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        Все заявки рассмотрены, можно теперь и
                                        кофейку выпить &#9749;
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <InfinityList onShow={() => fetchNextRequests()} />
                    <UserRequestModal
                        ref={sellerInfoModalRef}
                        request={selectedRequest}
                        onSuccess={() => sendUserAnswer(true)}
                        onDenied={() => sendUserAnswer(false)}
                    />
                </div>
                <div
                    className="admin-page__content__products"
                    hidden={tabOpened !== "products"}
                >
                    <h1 className="admin-page__content__products__h">
                        Заявки на выставление товаров
                    </h1>
                    <table className="admin-page__content__products__table">
                        <thead>
                            <tr>
                                <th width="60%">Название</th>
                                <th width="30%">Цена</th>
                                <th width="10%"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products && products.length > 0 ? (
                                products.map((request: ProductRequest) => (
                                    <tr key={request.id}>
                                        <td>{request.name}</td>
                                        <td>{convertMoney(request.price)}</td>
                                        <td
                                            className="link"
                                            onClick={() =>
                                                handleShowProduct(request)
                                            }
                                        >
                                            Подробнее
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        Все заявки рассмотрены, можешь теперь
                                        и кофейку выпить &#9749;
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <InfinityList
                        onShow={() => fetchDone && fetchNextRequests()}
                    />
                    <ProductRequestModal
                        ref={productInfoModalRef}
                        request={selectedProduct}
                        onSuccess={() => sendProductAnswer(true)}
                        onDenied={() => sendProductAnswer(false)}
                    />
                </div>
                <div
                    className="admin-page__content__promocode"
                    hidden={tabOpened !== "promocode"}
                >
                    <h1 className="admin-page__content__promocode__h">
                        Промокоды
                        <Button
                            title="Создать промокод"
                            onClick={() => setCreatePromocodeOpened(true)}
                        />
                    </h1>
                    <div className="admin-page__content__promocode__promocodes">
                        {(promocodes ?? []).map((promocode) => (
                            <div
                                key={promocode.code}
                                className="admin-page__content__promocode__promocodes__item"
                            >
                                <div className="admin-page__content__promocode__promocodes__item__percent">
                                    {promocode.percent} %
                                </div>
                                <div className="admin-page__content__promocode__promocodes__item__code">
                                    {promocode.code}
                                </div>
                                <div className="admin-page__content__promocode__promocodes__item__date">
                                    <span className="t">Действителен с</span>
                                    <span className="v">
                                        {new Date(
                                            promocode.startDate,
                                        ).toLocaleString()}
                                    </span>
                                    <span className="t">по</span>
                                    <span className="v">
                                        {new Date(
                                            promocode.endDate,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <InfinityList onShow={() => fetchPromocodes()} />
                    {createPromocodeOpened && (
                        <PromocodeModal
                            onFinish={(form) => {
                                handleCreatePromocode(form);
                            }}
                            onClose={() => setCreatePromocodeOpened(false)}
                        />
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default AdminPage;
