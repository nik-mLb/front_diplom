import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";

import LogoIcon from "../../shared/images/LogoFull.svg";

import "./styles.scss";
import TextField from "../../components/TextField/TextField";
import TextArea from "../../components/TextArea/TextArea";
import { ValidTypes } from "bazaar-validation";
import { sendRequest } from "../../api/seller";
import { AJAXErrors } from "../../api/errors";
import { useUserStore } from "../../stores/UserStore";

function SellerFormPage() {
    const navigate = useNavigate();
    const userStore = useUserStore();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    async function handleSendRequest() {
        if (name && description) {
            const code = await sendRequest(name, description);
            if (code === AJAXErrors.NoError) {
                userStore.me();
                navigate("/");
            }
        }
    }

    return (
        <div>
            <header />
            <main className="seller-form-page">
                <div className="seller-form-page__content">
                    <div className="seller-form-page__content__title">
                        <div>
                            <img
                                className="seller-form-page__content__title__icon"
                                src={LogoIcon}
                                alt="Логотип Базара"
                            />
                            <div className="seller-form-page__content__title__header">
                                <h1 className="seller-form-page__content__title__header__h1">
                                    Заявка на продавца
                                </h1>
                                <div className="seller-form-page__content__title__header__comment">
                                    Укажите данные компании
                                </div>
                            </div>
                        </div>
                        <Button
                            className="seller-form-page__content__title__redirect"
                            title="Вернуться на главную страницу"
                            variant="text"
                            onClick={() => navigate("/")}
                        />
                    </div>
                    <div className="seller-form-page__content__form">
                        <div className="seller-form-page__content__form__content">
                            <TextField
                                title="Название компании"
                                validType={ValidTypes.NotNullValid}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextArea
                                title="Описание компании"
                                validType={ValidTypes.NotNullValid}
                                rows={10}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="seller-form-page__content__form__actions">
                            <Button
                                title="Отправить заявку"
                                disabled={!(name && description)}
                                onClick={() => handleSendRequest()}
                            />
                        </div>
                    </div>
                </div>
            </main>
            <footer />
        </div>
    );
}

export default SellerFormPage;
