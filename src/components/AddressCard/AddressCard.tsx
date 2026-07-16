import "./styles.scss";

import homeIcon from "../../shared/images/home-ico.svg";

interface AddressCardProps {
    name?: string;
    address: string;
    active?: boolean;
    onClick?: () => void;
}

function AddressCard(props: AddressCardProps) {
    return (
        <div
            className={`address-card${props.active ? " address-card_active" : ""}`}
            onClick={() => props.onClick && props.onClick()}
        >
            <img className="address-card__icon" src={homeIcon} />
            <div className="address-card__description">
                <div className="address-card__title">
                    {props.name ? (
                        props.name
                    ) : (
                        <span style={{ color: "gray" }}>Без названия</span>
                    )}
                </div>
                <div className="address-card__address">{props.address}</div>
            </div>
        </div>
    );
}

export default AddressCard;
