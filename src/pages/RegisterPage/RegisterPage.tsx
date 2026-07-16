import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ValidTypes } from "bazaar-validation";
import { AJAXErrors } from "../../api/errors";
import Button from "../../components/Button/Button";
import Form, { type FormHandle } from "../../components/Form/Form";

import LogoIcon from "../../shared/images/LogoFull.svg";

import "./styles.scss";
import { useUserStore } from "../../stores/UserStore";

function RegisterPage() {
    const navigate = useNavigate();
    const userStore = useUserStore();
    const [errorKey, setErrorKey] = useState("");
    const [passwordHelp, setPasswordHelp] = useState(false);
    const formRef = useRef<FormHandle>(null);

    function handleFieldFocus(field: string) {
        if (field === "password" || field === "repeatPassword") {
            setPasswordHelp(true);
        }
    }

    async function handleClickSignup() {
        const validationResult = formRef.current!.validate();
        if (validationResult) {
            if (validationResult.password != validationResult.repeatPassword) {
                formRef.current!.setFieldStatus("password", true);
                formRef.current!.setFieldStatus("repeatPassword", true);
                setErrorKey("notRepeated");
                return;
            }

            const error = await userStore.signup({
                email: validationResult.email,
                password: validationResult.password,
                name: validationResult.name,
                surname: validationResult.surname,
            });

            if (error === AJAXErrors.NoError) {
                navigate("/");
            } else if (error === AJAXErrors.UserAlreadyExists) {
                formRef.current!.setFieldStatus("email", true);
                setErrorKey("userExists");
            }
        }
    }

    return (
        <div>
            <header />
            <main className="reg-page">
                <div className="reg-page__content">
                    <div className="reg-page__content__title">
                        <div>
                            <img
                                className="reg-page__content__title__icon"
                                src={LogoIcon}
                                alt="Логотип Базара"
                            />
                            <div className="reg-page__content__title__header">
                                <h1 className="reg-page__content__title__header__h1">
                                    Регистрация
                                </h1>
                                <div className="reg-page__content__title__header__comment">
                                    Заполните основную информацию о себе
                                </div>
                            </div>
                            <div className="reg-page__content__title__input-comment">
                                {errorKey &&
                                    {
                                        name: (
                                            <div className="reg-page__content__title__input-comment__error">
                                                Введите ваше настоящее имя с
                                                заглавной буквы. Пожалуста,
                                                повторите попытку ввода
                                            </div>
                                        ),

                                        email: (
                                            <div className="reg-page__content__title__input-comment__error">
                                                Email является
                                                недействительным. Пожалуста,
                                                повторите попытку ввода
                                            </div>
                                        ),

                                        password: (
                                            <div className="reg-page__content__title__input-comment__error">
                                                Формат пароля не верный.
                                                Пожалуйста учтите требования к
                                                паролю:
                                                <ul>
                                                    <li>
                                                        длина от 8 до 24
                                                        символов
                                                    </li>
                                                    <li>
                                                        хотя бы 1 заглавная и
                                                        прописная буква
                                                        латинского алфавита
                                                    </li>
                                                    <li>хотя бы 1 цифра</li>
                                                </ul>
                                            </div>
                                        ),

                                        repeatPassword: (
                                            <div className="reg-page__content__title__input-comment__error">
                                                Формат пароля не верный.
                                                Пожалуйста учтите требования к
                                                паролю:
                                                <ul>
                                                    <li>
                                                        длина от 8 до 24
                                                        символов
                                                    </li>
                                                    <li>
                                                        хотя бы 1 заглавная и
                                                        прописная буква
                                                        латинского алфавита
                                                    </li>
                                                    <li>хотя бы 1 цифра</li>
                                                </ul>
                                            </div>
                                        ),

                                        notRepeated: (
                                            <div className="reg-page__content__title__input-comment__error">
                                                Пароли не совпдают. Пожалуста,
                                                повторите попытку ввода
                                            </div>
                                        ),

                                        userExists: (
                                            <div className="reg-page__content__title__input-comment__error">
                                                Данная почта уже
                                                зарегистрирована. Пожалуста,
                                                повторите попытку ввода
                                            </div>
                                        ),
                                    }[errorKey]}
                                {!errorKey && passwordHelp && (
                                    <div className="reg-page__content__title__input-comment__help">
                                        Формат пароля не верный. Пожалуйста
                                        учтите требования к паролю:
                                        <ul>
                                            <li>длина от 8 до 24 символов</li>
                                            <li>
                                                хотя бы 1 заглавная и
                                                прописная буква латинского
                                                алфавита
                                            </li>
                                            <li>хотя бы 1 цифра</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            className="reg-page__content__title__redirect"
                            title="Вернуться на главную страницу"
                            variant="text"
                            onClick={() => navigate("/")}
                        />
                    </div>
                    <div className="reg-page__content__form">
                        <Form
                            ref={formRef}
                            className="reg-page__content__form__font-content"
                            form={[
                                {
                                    type: "text",
                                    id: "name",
                                    title: "Имя",
                                    validType: ValidTypes.NameValid,
                                },
                                {
                                    type: "text",
                                    id: "surname",
                                    title: "Фамилия (необязательно)",
                                    validType: ValidTypes.SurnameValid,
                                },
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
                                    validType: ValidTypes.PasswordValid,
                                },
                                {
                                    type: "password",
                                    id: "repeatPassword",
                                    title: "Повторите пароль",
                                    validType: ValidTypes.PasswordValid,
                                },
                            ]}
                            onFieldFocus={(field: string) =>
                                handleFieldFocus(field)
                            }
                            onEnd={(key: any) => {
                                setErrorKey(key);
                                setPasswordHelp(false);
                            }}
                        />
                        <div className="reg-page__content__form__actions">
                            <Button
                                title="Войти"
                                variant="text"
                                onClick={() => navigate("/signin")}
                            />
                            <Button
                                title="Зарегистрироваться"
                                variant="primary"
                                onClick={() => handleClickSignup()}
                            />
                        </div>
                    </div>
                </div>
            </main>
            <footer />
        </div>
    );
}

export default RegisterPage;
