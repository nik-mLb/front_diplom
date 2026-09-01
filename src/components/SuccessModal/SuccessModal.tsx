import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";

import "./styles.scss";

function SuccessModal() {
    const navigate = useNavigate();

    return (
        <div className="success-modal">
            <div className="success-modal__modal-shadow"></div>
            <div className="success-modal__modal-content">
                <h2>Заказ успешно оформлен</h2>
                <Button title="На главную" onClick={() => navigate("/")} />
            </div>
        </div>
    );
}

export default SuccessModal;
