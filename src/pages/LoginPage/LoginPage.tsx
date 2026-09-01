import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ValidTypes } from "bazaar-validation";
import { AJAXErrors } from "../../api/errors";
import Button from "../../components/Button/Button";
import Form, { type FormHandle } from "../../components/Form/Form";
import LogoIcon from "../../shared/images/LogoFull.svg";
import "./styles.scss";
import { useUserStore } from "../../stores/UserStore";

function LoginPage() {
    const navigate = useNavigate();
    const userStore = useUserStore();
    const [errorKey, setErrorKey] = useState("");
    const formRef = useRef<FormHandle>(null);

    async function handleClickSignin() {
        const validationResult = formRef.current!.validate();
        if (validationResult) {
            const error = await userStore.signin({
                email: validationResult.email,
                password: validationResult.password,
            });

            if (error === AJAXErrors.NoError) {
                navigate("/");
            } else if (error === AJAXErrors.NoUser) {
                formRef.current!.setFieldStatus("password", true);
                setErrorKey("wrongPassword");
            } else if (error === AJAXErrors.ServerError) {
                setErrorKey("serviceError");
            }
        }
    }

    return (
        <div>
            <header />
            <main className="login-page">
                <div className="login-page__content">
                    <div className="login-page__content__title">
                        <div>
                            <img
                                className="login-page__content__title__icon"
                                src={LogoIcon}
                                alt="Логотип Базара"
                            />
                            <div className="login-page__content__title__header">
                                <h1 className="login-page__content__title__header__h1">
                                    Вход
                                </h1>
                                <div className="login-page__content__title__header__comment">
                                    Укажите данные для входа
                                </div>
                            </div>
                            <div className="login-page__content__title__input-comment">
                                {errorKey &&
                                    {
                                        email: (
                                            <div className="login-page__content__title__input-comment__error">
                                                Email является
                                                недействительным. Пожалуста,
                                                повторите попытку ввода
                                            </div>
                                        ),

                                        password: (
                                            <div className="login-page__content__title__input-comment__error">
                                                Не введён пароль. Пожалуста,
                                                повторите попытку ввода
                                            </div>
                                        ),

                                        wrongPassword: (
                                            <div className="login-page__content__title__input-comment__error">
                                                Указана неверная почта или
                                                пароль. Пожалуйста, повторите
                                                ввод.
                                            </div>
                                        ),

                                        serviceError: (
                                            <div className="login-page__content__title__input-comment__error">
                                                Ошибка сервиса. Пожалуйста,
                                                повторите попытку позже.
                                            </div>
                                        ),
                                    }[errorKey]}
                            </div>
                        </div>
                        <Button
                            className="login-page__content__title__redirect"
                            title="Вернуться на главную страницу"
                            variant="text"
                            onClick={() => navigate("/")}
                        />
                    </div>
                    <div className="login-page__content__form">
                        <Form
                            ref={formRef}
                            className="login-page__content__form__font-content"
                            form={[
                                {
                                    type: "email",
                                    id: "email",
                                    title: "Электронная почта",
                                    validType: ValidTypes.EmailValid,
                                },
                                {
                                    type: "password",
                                    id: "password",
                                    title: "Пароль",
                                    validType: ValidTypes.NotNullValid,
                                },
                            ]}
                            onEnd={(key: any) => setErrorKey(key)}
                        />
                        <div className="login-page__content__form__actions">
                            <Button
                                title="Регистрация"
                                variant="text"
                                onClick={() => navigate("/signup")}
                            />
                            <Button
                                title="Войти"
                                variant="primary"
                                onClick={() => handleClickSignin()}
                            />
                        </div>
                    </div>
                </div>
            </main>
            <footer />
        </div>
    );
}

export default LoginPage;
