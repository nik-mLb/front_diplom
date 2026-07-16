import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./styles.scss";

import ProfilePicture from "../../shared/images/header-profile-ico.svg";
import Button from "../../components/Button/Button";
import TextField from "../../components/TextField/TextField";
import { getMe, updateMe, updatePassword, uploadAvatar } from "../../api/user";
import { AJAXErrors } from "../../api/errors";
import { ValidTypes } from "bazaar-validation";
import { logout } from "../../api/auth";
import { useUserStore } from "../../stores/UserStore";

interface ProfileForm {
    name: string;
    surname: string;
    phoneNumber: string;
    avatarURL: string;
    email: string;
    oldPassword: string;
    password: string;
    repeatPassword: string;
}

function ProfilePage() {
    const navigate = useNavigate();
    const userStore = useUserStore();

    const [form, setForm] = useState<ProfileForm>({
        name: "",
        surname: "",
        phoneNumber: "",
        avatarURL: "",
        email: "",
        oldPassword: "",
        password: "",
        repeatPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [successData, setSuccessData] = useState(false);
    const [successPassword, setSuccessPassword] = useState(false);

    async function fetchProfileInfo() {
        const response = await getMe();

        if (response.code === AJAXErrors.NoError) {
            setForm((prev) => ({
                ...prev,
                name: response.data!.name,
                surname: response.data!.surname ?? "",
                avatarURL: response.data!.imageURL ?? "",
                email: response.data!.email,
                phoneNumber: response.data!.phoneNumber ?? "",
            }));
        } else {
            navigate("/signin");
        }
    }

    useEffect(() => {
        fetchProfileInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getFullName() {
        if (form.name) {
            if (form.surname) {
                return `${form.name} ${form.surname}`;
            }
            return `${form.name}`;
        }
        return `Анонимный пользователь`;
    }

    function handleChange(key: keyof ProfileForm, ok: boolean, v: string) {
        if (key === "phoneNumber" && !v) {
            return;
        }

        if (ok) {
            if (errors[key]) {
                setErrors((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
            }
        } else {
            setErrors((prev) => ({ ...prev, [key]: true }));
        }
        setForm((prev) => ({ ...prev, [key]: v }));
        setSuccessData(false);
        setSuccessPassword(false);
    }

    async function handleSaveData() {
        const code = await updateMe(form.name, form.surname, form.phoneNumber);
        if (code === AJAXErrors.NoError) {
            setSuccessData(true);
        }
    }

    async function handleSavePassword() {
        setErrors((prev) => {
            const next = { ...prev };
            delete next.notRepeatPassword;
            delete next.wrongPassword;
            return next;
        });

        if (form.password != form.repeatPassword) {
            setErrors((prev) => ({ ...prev, notRepeatPassword: true }));
            return;
        }

        const code = await updatePassword(form.oldPassword, form.password);
        if (code === AJAXErrors.WrongPassword) {
            setErrors((prev) => ({ ...prev, wrongPassword: true }));
        }

        if (code === AJAXErrors.NoError) {
            setSuccessPassword(true);
        }
    }

    async function handleLogout() {
        const code = await logout();
        if (code === AJAXErrors.NoError) {
            userStore.logout();
            navigate("/");
        }
    }

    async function handleUploadAvatar(event: any) {
        const file = event.target.files[0];
        const response = await uploadAvatar(file);
        if (response.code === AJAXErrors.NoError) {
            setForm((prev) => ({ ...prev, avatarURL: response.url! }));
        }
    }

    return (
        <div className="container">
            <Header />

            <main className="profile-page flex">
                <div className="nav-column flex column">
                    <img
                        className="avatar"
                        src={form.avatarURL ? form.avatarURL : `${ProfilePicture}`}
                        alt="Аватар пользователя"
                    />

                    <h2 className="h-reset name">{getFullName()}</h2>

                    <ol className="list-reset menu flex column">
                        <li className="menu-item active">Мои данные</li>
                        <li className="menu-item active">
                            <label style={{ cursor: "pointer" }}>
                                <input
                                    type="file"
                                    accept=".jpg,.png"
                                    style={{ display: "none" }}
                                    onChange={(ev) => handleUploadAvatar(ev)}
                                />
                                Сменить аватарку
                            </label>
                        </li>

                        <li
                            className="menu-item error active"
                            onClick={() => handleLogout()}
                        >
                            Выйти из профиля
                        </li>
                    </ol>
                </div>

                <div id="personal-data" className="tab active">
                    <div>
                        <h2 className="h-reset" style={{ marginBottom: "8px" }}>
                            Мои данные
                        </h2>
                        <p className="help">
                            Здесь Вы можете изменить свои персональные данные.
                            Они будут использоваться при создании заказа.
                        </p>
                    </div>

                    <div className="main-content flex column">
                        <div className="fields-wrapper">
                            <div className="fields-column">
                                <TextField
                                    fieldName="Имя"
                                    value={form.name}
                                    onEnd={(ok, v) => {
                                        if (v) {
                                            handleChange("name", ok, v);
                                        }
                                    }}
                                    validType={ValidTypes.NameValid}
                                    maxLength={"20"}
                                />

                                <TextField
                                    fieldName="Фамилия"
                                    value={form.surname}
                                    onEnd={(ok, v) => {
                                        if (v !== undefined && v !== null) {
                                            handleChange("surname", ok, v);
                                        }
                                    }}
                                    validType={ValidTypes.SurnameValid}
                                    maxLength={20}
                                />

                                <TextField
                                    type="tel"
                                    fieldName="Телефон"
                                    value={form.phoneNumber}
                                    onEnd={(ok, v) => {
                                        if (v) {
                                            handleChange("phoneNumber", ok, v);
                                        }
                                    }}
                                    validType={ValidTypes.TelephoneValid}
                                    title="Введите номер телефона"
                                    maxLength={20}
                                    min={10000000000}
                                    max={99999999999}
                                    canEmpty={true}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        {successData && (
                                            <span style={{ color: "green" }}>
                                                Данные обновлены
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        className="save button-wrapper"
                                        disabled={
                                            errors.name ||
                                            errors.surname ||
                                            errors.phoneNumber
                                        }
                                        title="Сохранить данные"
                                        onClick={() => handleSaveData()}
                                    />
                                </div>
                            </div>

                            <div className="fields-column">
                                <TextField
                                    fieldName="Старый пароль"
                                    title=""
                                    type="password"
                                    validType={ValidTypes.NotNullValid}
                                    value={form.oldPassword}
                                    onEnd={(ok, v) =>
                                        handleChange("oldPassword", ok, v)
                                    }
                                />

                                <TextField
                                    fieldName="Новый пароль"
                                    title=""
                                    validType={ValidTypes.PasswordValid}
                                    type="password"
                                    value={form.password}
                                    onEnd={(ok, v) =>
                                        handleChange("password", ok, v)
                                    }
                                />
                                <TextField
                                    fieldName="Новый пароль ещё раз"
                                    title=""
                                    validType={ValidTypes.PasswordValid}
                                    type="password"
                                    value={form.repeatPassword}
                                    onEnd={(ok, v) =>
                                        handleChange("repeatPassword", ok, v)
                                    }
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        {errors.notRepeatPassword && (
                                            <span style={{ color: "red" }}>
                                                Пароли не совпадают!
                                            </span>
                                        )}
                                        {errors.wrongPassword && (
                                            <span style={{ color: "red" }}>
                                                Неверный старый пароль!
                                            </span>
                                        )}
                                        {successPassword && (
                                            <span style={{ color: "green" }}>
                                                Пароль обновлен
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        className="save"
                                        title="Изменить пароль"
                                        disabled={
                                            errors.password ||
                                            errors.repeatPassword ||
                                            errors.oldPassword
                                        }
                                        onClick={() => handleSavePassword()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ProfilePage;
