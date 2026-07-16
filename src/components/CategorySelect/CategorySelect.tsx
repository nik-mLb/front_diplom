import { useEffect, useState } from "react";
import "./styles.scss";
import { getAllCategories } from "../../api/categories";
import { AJAXErrors } from "../../api/errors";
import { useProductsStore } from "../../stores/ProductsStore";

interface CategorySelectProps {
    className?: string;
    onSelect: (id: string) => void;
}

function CategorySelect({ className, onSelect }: CategorySelectProps) {
    const productsStore = useProductsStore();

    const [content, setContent] = useState("Категория товара не выбрана");
    const [categories, setCategories] = useState<any[]>([]);
    const [selectCategory, setSelectCategory] = useState<any>(null);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [opened, setOpened] = useState(false);

    async function fetchCategories() {
        const { code, data } = await getAllCategories();
        if (code === AJAXErrors.NoError) {
            setCategories(data!.categories);
        }
    }

    async function fetchSubCategories(category: any) {
        const data = await productsStore.getSubCategories(category.id);
        setSubcategories(data);
        setSelectCategory(category);
    }

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`category-select ${className ?? ""}`.trim()}>
            <div
                className="category-select__text"
                onClick={() => setOpened(!opened)}
            >
                {content}
            </div>
            {opened && (
                <div className="category-select__popup">
                    <div className="category-select__popup__categories">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="category-select__popup__categories__item"
                                onMouseOver={() => fetchSubCategories(category)}
                            >
                                {category.name}
                            </div>
                        ))}
                    </div>
                    <div className="category-select__popup__subcategories">
                        {subcategories.map((subcategory) => (
                            <div
                                key={subcategory.id}
                                className="category-select__popup__subcategories__item"
                                onClick={() => {
                                    setContent(
                                        `${selectCategory.name} - ${subcategory.name}`,
                                    );
                                    setOpened(false);
                                    onSelect(subcategory.id);
                                }}
                            >
                                {subcategory.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategorySelect;
