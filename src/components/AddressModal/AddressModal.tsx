import { useState } from "react";
import TextField from "../TextField/TextField";
import "./styles.scss";

import crossIcon from "../../shared/images/cross-ico.svg";
import loadingIcon from "../../shared/images/loading-ico.svg";

import Button from "../Button/Button";
import { ValidTypes } from "bazaar-validation";
import ajax from "bazaar-ajax";
import { GEOPIFY_KEY } from "../../settings";
import { saveAddress } from "../../api/address";
import { AJAXErrors } from "../../api/errors";

interface AddressForm {
    name: string;
    city: string;
    street: string;
    house: string;
    flat: string;
}

interface AddressModalProps {
    opened?: boolean;
    onEnd?: (ok: boolean) => void;
    onClose?: () => void;
}

function AddressModal(props: AddressModalProps) {
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<any[] | null>(null);
    const [selectedResult, setSelectedResult] = useState(-1);
    const [sended, setSended] = useState(false);
    const [form, setForm] = useState<AddressForm>({
        name: "",
        city: "",
        street: "",
        house: "",
        flat: "",
    });

    async function handleCheckAddress(address: AddressForm) {
        const res = await ajax.get(
            "v1/geocode/search?" +
                Object.entries({
                    lang: "ru",
                    apiKey: GEOPIFY_KEY,
                    country: "Russia",
                    city: address.city,
                    street: address.street,
                    housenumber: address.house,
                })
                    .map(([K, E]) => `${K}=${encodeURIComponent(`${E}`)}`)
                    .join("&"),
            { origin: "https://api.geoapify.com", noCredentials: true },
        );

        if (!res.error) {
            const responseData = await res.result.json();
            setSearching(false);
            setSelectedResult(-1);
            setSearchResult(
                (responseData.features ?? [])
                    .filter(
                        (E: any) =>
                            E.properties.result_type == "building" &&
                            (E.properties.rank.importance != undefined ||
                                E.properties.rank.popularity != undefined),
                    )
                    .map((E: any) => ({
                        lat: E.properties.lat,
                        log: E.properties.lng,
                        addressName: E.properties.address_line1,
                        addressSurname: E.properties.address_line2,
                        address: E.properties.formatted,
                        importance: E.properties.rank.importance,
                        rawData: E.properties,
                    })),
            );
        }

        return false;
    }

    function handleUpdateForm(name: keyof AddressForm, value: string) {
        setForm({ ...form, [name]: value });
    }

    async function handleSearch() {
        setSearching(true);
        await handleCheckAddress(form);
    }

    async function handleSave() {
        setSended(true);

        const address = searchResult![selectedResult];
        const code = await saveAddress(
            address.rawData.state,
            address.rawData.city,
            (form.flat ? `кв. ${form.flat}, ` : "") + address.address,
            `${address.lat},${address.log}`,
            form.name,
        );

        if (code === AJAXErrors.NoError) {
            props.onEnd && props.onEnd(true);
        }

        setSended(false);
    }

    return (
        <div className={`address-modal${!props.opened ? " close" : ""}`}>
            <div className="address-modal__modal-shadow"></div>
            {!searchResult ? (
                <div className="address-modal__modal-content">
                    <div className="address-modal__modal-content__title">
                        <h2>Добавление нового адреса</h2>
                        <img
                            className="address-modal__modal-content__title__close-button"
                            src={crossIcon}
                            onClick={() => props.onClose && props.onClose()}
                        />
                    </div>
                    <hr />
                    <p className="address-modal__modal-content__description">
                        <TextField
                            className="address-modal__modal-content__description__name"
                            title="Название адреса"
                            validType={ValidTypes.NotNullValid}
                            value={form.name}
                            status={searching ? "success" : "default"}
                            onEnd={(_ok, value) =>
                                handleUpdateForm("name", value)
                            }
                        />
                        <TextField
                            className="address-modal__modal-content__description__city"
                            title="Город"
                            validType={ValidTypes.NotNullValid}
                            value={form.city}
                            status={searching ? "success" : "default"}
                            onEnd={(_ok, value) =>
                                handleUpdateForm("city", value)
                            }
                        />
                        <TextField
                            className="address-modal__modal-content__description__street"
                            title="Улица"
                            validType={ValidTypes.NotNullValid}
                            value={form.street}
                            status={searching ? "success" : "default"}
                            onEnd={(_ok, value) =>
                                handleUpdateForm("street", value)
                            }
                        />
                        <TextField
                            className="address-modal__modal-content__description__house"
                            title="Дом"
                            validType={ValidTypes.NotNullValid}
                            value={form.house}
                            status={searching ? "success" : "default"}
                            onEnd={(_ok, value) =>
                                handleUpdateForm("house", value)
                            }
                        />
                        <TextField
                            className="address-modal__modal-content__description__flat"
                            title="Квартира"
                            validType={ValidTypes.NotNullValid}
                            value={form.flat}
                            status={searching ? "success" : "default"}
                            onEnd={(_ok, value) =>
                                handleUpdateForm("flat", value)
                            }
                        />
                    </p>
                    <div className="address-modal__modal-content__actions">
                        <Button
                            className="address-modal__modal__actions__save"
                            title="Искать"
                            onClick={() => handleSearch()}
                        />
                        {searching && (
                            <div className="address-modal__modal-content__actions__loading">
                                <span>Поиск совпадений</span>
                                <img src={loadingIcon} />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="address-modal__modal-content">
                    <div className="address-modal__modal-content__title">
                        <h2>Добавление нового адреса</h2>
                        <img
                            className="address-modal__modal-content__title__close-button"
                            src={crossIcon}
                            onClick={() => props.onClose && props.onClose()}
                        />
                    </div>
                    <hr />
                    <p className="address-modal__modal-content__search-result">
                        {searchResult.length === 0 ? (
                            <p>
                                Данный адрес не найден. Проверьте
                                правильности введённого адреса
                            </p>
                        ) : (
                            searchResult.map((result, I) => (
                                <article
                                    key={I}
                                    className={`address-modal__modal-content__search-result__card${I == selectedResult ? " address-modal__modal-content__search-result__card_selected" : ""}`}
                                    onClick={() => setSelectedResult(I)}
                                >
                                    <p className="name">
                                        {result.addressName}
                                    </p>
                                    <p className="surname">
                                        {result.addressSurname}
                                    </p>
                                </article>
                            ))
                        )}
                    </p>
                    <div className="address-modal__modal-content__actions">
                        <Button
                            className="edit"
                            variant="text"
                            title="Ввести другой адрес"
                            onClick={() => setSearchResult(null)}
                        />
                        {selectedResult !== -1 && (
                            <Button
                                className="edit"
                                title="Сохранить"
                                onClick={() => handleSave()}
                                disabled={sended}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddressModal;
