import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";

import "./styles.scss";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import PaymentType from "../../components/PaymentType/PaymentType";

import spbIcon from "../../shared/images/cbp-ico.svg";
import moneyIcon from "../../shared/images/money-ico.svg";
import loadingIcon from "../../shared/images/loading-ico.svg";

import AddressCard from "../../components/AddressCard/AddressCard";
import AddressModal from "../../components/AddressModal/AddressModal";

import { AJAXErrors } from "../../api/errors";
import { calculateOrderParams, sendOrder } from "../../api/order";
import { getUserAddresses } from "../../api/address";
import SuccessModal from "../../components/SuccessModal/SuccessModal";
import TextField, { type TextFieldHandle } from "../../components/TextField/TextField";

import { checkPromocode } from "../../api/promocode";
import { useUserStore } from "../../stores/UserStore";

function showBeautifulNumber(value: number) {
    return value.toLocaleString("ru");
}

function PlaceOrderPage() {
    const navigate = useNavigate();
    const userStore = useUserStore();

    const [total, setTotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [activeAddress, setActiveAddress] = useState("");
    const [addAddressModalOpened, setAddAddressModalOpened] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [successMessageOpened, setSuccessMessageOpened] = useState(false);

    const [promocode, setPromocode] = useState("");
    const [promocodePercent, setPromocodePercent] = useState<number | null>(
        null,
    );
    const [promocodeSuccessStatus, setPromocodeSuccessStatus] = useState(0);
    const promocodeTextFieldRef = useRef<TextFieldHandle>(null);

    async function fetchOrder() {
        const { code, parametres } = await calculateOrderParams();
        if (code === AJAXErrors.NoError) {
            setTotal(parametres!.price);
            setDiscount(parametres!.discountPrice);
        } else {
            navigate("/signin");
        }
    }

    async function fetchAddresses() {
        const { code, addresses: newAddresses } = await getUserAddresses();
        if (code === AJAXErrors.NoError) {
            setAddAddressModalOpened(false);
            setAddresses(newAddresses!);
            if (newAddresses!.length === 1) {
                setActiveAddress(newAddresses![0].id);
            }
        } else {
            navigate("/signin");
        }
    }

    useEffect(() => {
        fetchOrder();
        fetchAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handlePlaceOrder() {
        const code = await sendOrder({
            payType: "money",
            address: activeAddress,
            promocode: promocode,
        });

        if (code === AJAXErrors.NoError) {
            setSuccessMessageOpened(true);
            userStore.getNofitications();
        }
    }

    async function handleCheckPromocode() {
        promocodeTextFieldRef.current!.changeStatus("default");
        setPromocodeSuccessStatus(1);
        const { code, data } = await checkPromocode(promocode);
        if (code === AJAXErrors.NoError) {
            if (data!.valid) {
                promocodeTextFieldRef.current!.changeStatus("success");
                setPromocodeSuccessStatus(3);
                setPromocodePercent(data!.percent ?? null);
            } else {
                promocodeTextFieldRef.current!.changeStatus("invalid");
                setPromocodeSuccessStatus(2);
                setPromocodePercent(null);
            }
        }
    }

    function handleChangePromocode(newPromocode: string) {
        promocodeTextFieldRef.current!.changeStatus("default");
        setPromocodeSuccessStatus(0);
        setPromocode(newPromocode);
    }

    return (
        <div className="place-order-page">
            {successMessageOpened && <SuccessModal />}
            <Header />
            <main>
                <h1>Оформление заказа</h1>
                <div className="content">
                    <div className="content__settings">
                        <h2>Способ оплаты</h2>
                        <div className="content__settings__payment-types">
                            <PaymentType
                                icon={moneyIcon}
                                name="Наличными"
                                active={true}
                            />
                            <PaymentType
                                icon={spbIcon}
                                name="СПБ"
                                disabled={true}
                            />
                        </div>
                        <div className="content__settings__promocode">
                            <h2>Промокод</h2>
                            <div className="content__settings__promocode__value">
                                <TextField
                                    ref={promocodeTextFieldRef}
                                    title="Промокод"
                                    onChange={(v) =>
                                        handleChangePromocode(v.target.value)
                                    }
                                />
                                <Button
                                    title="Проверить"
                                    disabled={
                                        promocodeSuccessStatus % 2 !== 0 ||
                                        promocode == ""
                                    }
                                    onClick={() => handleCheckPromocode()}
                                />
                                {promocodeSuccessStatus === 1 && (
                                    <img
                                        className="content__settings__promocode__value__loading"
                                        src={loadingIcon}
                                    />
                                )}
                            </div>
                            {promocodeSuccessStatus === 2 && (
                                <div style={{ color: "red" }}>
                                    Промокод не найден или недействителен
                                </div>
                            )}
                        </div>
                        <div className="content__settings__address-title">
                            <h2>Адрес доставки</h2>
                            <Button
                                className="content__settings__address-title__add-address-button"
                                title="Добавить адрес"
                                variant="text"
                                onClick={() => setAddAddressModalOpened(true)}
                            />
                        </div>
                        <div className="content__settings__addresses">
                            {addresses.map((address) => (
                                <AddressCard
                                    key={address.id}
                                    name={address.label}
                                    address={address.addressString}
                                    active={activeAddress === address.id}
                                    onClick={() =>
                                        setActiveAddress(address.id)
                                    }
                                />
                            ))}
                            {addresses.length === 0 && (
                                <div className="content__settings__addresses_no-address">
                                    У вас пока нет ни одного адреса доставки
                                </div>
                            )}
                        </div>
                        <div className="content__settings__date">
                            <h2>Срок доставки:</h2>5 рабочих дней
                        </div>
                        {addAddressModalOpened && (
                            <AddressModal
                                opened={addAddressModalOpened}
                                onEnd={(ok) => {
                                    if (ok) {
                                        fetchAddresses();
                                    } else {
                                        setAddAddressModalOpened(false);
                                    }
                                }}
                                onClose={() => {
                                    setAddAddressModalOpened(false);
                                }}
                            />
                        )}
                    </div>
                    <div className="content__total">
                        <Button
                            className="content__total__make-order"
                            title="Оформление заказа"
                            disabled={activeAddress === ""}
                            onClick={() => handlePlaceOrder()}
                        />
                        {total != discount && (
                            <div className="content__total__discount">
                                <span>Скидка:</span>
                                <span className="content__total__discount_cost">
                                    {showBeautifulNumber(total - discount)}
                                    &nbsp;₽
                                </span>
                            </div>
                        )}
                        {promocodePercent && (
                            <div className="content__total__promocode">
                                <span>Промокод:</span>
                                <span className="content__total__promocode_cost">
                                    -{promocodePercent} %
                                </span>
                            </div>
                        )}
                        <div className="content__total__sum-cost">
                            <span>Итог:</span>
                            <span className="content__total__sum-cost_cost">
                                {showBeautifulNumber(
                                    parseInt(
                                        (discount *
                                            (100 - (promocodePercent ?? 0))) /
                                            100 +
                                            "",
                                    ),
                                )}
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

export default PlaceOrderPage;
