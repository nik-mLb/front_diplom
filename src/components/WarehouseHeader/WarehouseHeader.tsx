import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button, {
    BUTTON_SIZE,
    BUTTON_VARIANT,
    ICON_POSITION,
} from "../Button/Button";

import LogoFull from "../../shared/images/LogoFull.svg";

import LogoutIcon from "../../shared/images/logout-ico.svg";
import LogoutIconHover from "../../shared/images/logout-ico-hover.svg";

import "./styles.scss";

function WarehouseHeader() {
    const navigate = useNavigate();
    const [logoutIcon, setLogoutIcon] = useState(LogoutIcon);

    return (
        <header className="header-admin header_light">
            <div className="header-admin__nav">
                <div className="header-admin__nav__row header-admin__nav__row_main">
                    <div className="header-admin__nav__logo">
                        <img
                            className="header-admin__nav__logo__img"
                            alt="Логотип маркетплейса Bazaar"
                            src={`${LogoFull}`}
                            onClick={() => navigate("/")}
                        />
                        <span className="header-admin__nav__logo__text">
                            СКЛАД
                        </span>
                    </div>

                    <div className="header-admin__nav__row_main__icons-wrapper">
                        <Button
                            className="header-admin__nav__row_main__icons-wrapper__item"
                            size={`${BUTTON_SIZE.L}`}
                            variant={`${BUTTON_VARIANT.TRANSPARENT}`}
                            iconPosition={`${ICON_POSITION.TOP}`}
                            title="Выйти"
                            iconSrc={logoutIcon}
                            onMouseOver={() => setLogoutIcon(LogoutIconHover)}
                            onMouseLeave={() => setLogoutIcon(LogoutIcon)}
                            onClick={() => navigate("/")}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default WarehouseHeader;
