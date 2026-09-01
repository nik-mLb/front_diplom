import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { getProducts, type Product } from "../api/product";
import { AJAXErrors } from "../api/errors";
import { getAllCategories, getSubCategories } from "../api/categories";

export interface Category {
    id: string;
    name: string;
}

export interface ProductsStoreValue {
    products: Product[] | null;
    categories: Record<string, Category> | null;
    subcategories: Record<string, any[]>;
}

interface ProductsStoreContextValue {
    value: ProductsStoreValue;
    all: () => Promise<Product[]>;
    getCategories: () => Promise<Category[]>;
    getSubCategories: (categoryId: string) => Promise<any[]>;
}

const ProductsStoreContext = createContext<ProductsStoreContextValue | null>(
    null,
);

export function ProductsStoreProvider({ children }: { children: ReactNode }) {
    const [value, setValue] = useState<ProductsStoreValue>({
        products: null,
        categories: null,
        subcategories: {},
    });
    const valueRef = useRef<ProductsStoreValue>(value);
    valueRef.current = value;

    const mergeValue = useCallback((patch: Partial<ProductsStoreValue>) => {
        setValue((prev) => {
            const next = { ...prev, ...patch };
            valueRef.current = next;
            return next;
        });
    }, []);

    const all = useCallback(async () => {
        const { code, products } = await getProducts(0);
        if (code === AJAXErrors.NoError) {
            mergeValue({ products: products ?? [] });
            return products ?? [];
        }
        return [];
    }, [mergeValue]);

    const categoryList = useCallback(async () => {
        const { code, data } = await getAllCategories();
        if (code === AJAXErrors.NoError && data) {
            const categories: Record<string, Category> = Object.fromEntries(
                data.categories.map((category) => [
                    category.id,
                    { id: category.id, name: category.name },
                ]),
            );
            mergeValue({ categories });
            return categories;
        }
        return {};
    }, [mergeValue]);

    const getCategories = useCallback(async () => {
        if (valueRef.current.categories) {
            return Object.values(valueRef.current.categories);
        }
        return Object.values(await categoryList());
    }, [categoryList]);

    const getSubCategoriesAction = useCallback(
        async (categoryId: string) => {
            if (valueRef.current.subcategories[categoryId]) {
                return valueRef.current.subcategories[categoryId];
            }
            const sub = await getSubCategories(categoryId);
            if (sub.code === AJAXErrors.NoError && sub.data) {
                mergeValue({
                    subcategories: {
                        ...valueRef.current.subcategories,
                        [categoryId]: sub.data.subcategories,
                    },
                });
                return sub.data.subcategories;
            }
            return [];
        },
        [mergeValue],
    );

    return (
        <ProductsStoreContext.Provider
            value={{
                value,
                all,
                getCategories,
                getSubCategories: getSubCategoriesAction,
            }}
        >
            {children}
        </ProductsStoreContext.Provider>
    );
}

export function useProductsStore(): ProductsStoreContextValue {
    const context = useContext(ProductsStoreContext);
    if (!context) {
        throw new Error(
            "useProductsStore must be used within ProductsStoreProvider",
        );
    }
    return context;
}
