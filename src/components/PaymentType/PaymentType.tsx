import "./styles.scss";

interface PaymentTypeProps {
    icon: string;
    name: string;
    active?: boolean;
    disabled?: boolean;
}

function PaymentType(props: PaymentTypeProps) {
    return (
        <div
            className={`payment-type ${props.disabled ? "payment-type_disabled" : ""}${props.active ? "payment-type_active" : ""}`}
        >
            <img className="payment-type__icon" src={props.icon} />
            <div className="payment-type__description">
                <div className="payment-type__description__title">
                    {props.name}
                </div>
                {props.disabled && (
                    <div className="disabledpayment-type__description__disabled">
                        Недоступно
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentType;
