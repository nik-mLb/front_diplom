import { cloneElement, isValidElement, type MouseEvent } from "react";
import "./styles.scss";

export const ICON_POSITION = {
    TOP: "top",
    RIGHT: "right",
    BOTTOM: "bottom",
    LEFT: "left",
};

export const BUTTON_VARIANT = {
    TEXT: "text",
    PRIMARY: "primary",
    TRANSPARENT: "transparent",
};

export const BUTTON_SIZE = {
    XS: "xs",
    S: "s",
    M: "m",
    L: "l",
};

interface ButtonProps {
    size?: string;
    variant?: string;
    iconPosition?: string;
    className?: string;
    disabled?: boolean;
    icon?: any;
    iconSrc?: string;
    iconAlt?: string;
    badgeTitle?: string | number;
    title?: string;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onMouseOver?: (event: MouseEvent<HTMLButtonElement>) => void;
    onMouseLeave?: (event: MouseEvent<HTMLButtonElement>) => void;
}

function Button(props: ButtonProps) {
    const size = props.size ?? BUTTON_SIZE.L;
    const variant = props.variant ?? BUTTON_VARIANT.PRIMARY;
    const iconPosition = props.iconPosition ?? ICON_POSITION.LEFT;
    const otherClasses = props.className ?? "";

    return (
        <button
            type="button"
            disabled={props.disabled}
            className={`button button_${size}_size button_${variant} button_${iconPosition} ${otherClasses}`.trim()}
            onClick={(event) => (props.onClick ? props.onClick(event) : {})}
            onMouseOver={(event) =>
                props.onMouseOver ? props.onMouseOver(event) : {}
            }
            onMouseLeave={(event) =>
                props.onMouseLeave ? props.onMouseLeave(event) : {}
            }
        >
            {props.icon
                ? isValidElement(props.icon)
                    ? cloneElement(props.icon as any, {
                          className:
                              (props.icon as any).props.className ??
                              "" + ` ${`icon icon_${size}_size`}`.trim(),
                      })
                    : props.icon
                : props.iconSrc && (
                      <div style={{ position: "relative", display: "flex" }}>
                          <img
                              alt={`${props.iconAlt}`}
                              src={`${props.iconSrc}`}
                              className={`icon icon_${size}_size`}
                          />
                          {props.badgeTitle && (
                              <span className="badge">
                                  {props.badgeTitle}
                              </span>
                          )}
                      </div>
                  )}
            {props.title && <span>{props.title}</span>}
        </button>
    );
}

export default Button;
