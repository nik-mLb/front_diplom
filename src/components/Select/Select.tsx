import { useState } from "react";

import ArrowDown from "../../shared/images/arrow-down-ico.svg";

import "./styles.scss";
import Button from "../Button/Button";

interface SelectOption {
    key: string;
    name: string;
}

interface SelectProps {
    options: SelectOption[];
    defaultValue?: string;
    onSelect?: (key: string) => void;
}

function Select(props: SelectProps) {
    const [opened, setOpened] = useState(false);
    const [selected, setSelected] = useState<SelectOption | null>(
        props.defaultValue
            ? (props.options.filter((E) => E.key === props.defaultValue)[0] ??
                  null)
            : null,
    );

    return (
        <div className="select">
            <div
                className="select__value"
                onClick={() => setOpened(!opened)}
            >
                <div className="select__value__text">
                    {selected?.name ?? "Не выбрано"}
                </div>
                <Button className="select__value__btn" iconSrc={ArrowDown} />
            </div>
            <div className={`select__options${opened ? " opened" : ""}`}>
                {props.options.map((option) => (
                    <div
                        key={option.key}
                        className="select__options__option"
                        onClick={() => {
                            setSelected(option);
                            setOpened(false);
                            if (props.onSelect) props.onSelect(option.key);
                        }}
                    >
                        {option.name}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Select;
