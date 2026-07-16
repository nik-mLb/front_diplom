import { createContext, useContext, useState, type ReactNode } from "react";

export interface CSATStoreValue {
    [key: string]: any;
}

interface CSATStoreContextValue {
    value: CSATStoreValue;
}

const CSATStoreContext = createContext<CSATStoreContextValue | null>(null);

export function CSATStoreProvider({ children }: { children: ReactNode }) {
    const [value] = useState<CSATStoreValue>({});

    return (
        <CSATStoreContext.Provider value={{ value }}>
            {children}
        </CSATStoreContext.Provider>
    );
}

export function useCSATStore(): CSATStoreContextValue {
    const context = useContext(CSATStoreContext);
    if (!context) {
        throw new Error("useCSATStore must be used within CSATStoreProvider");
    }
    return context;
}
