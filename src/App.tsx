import { Route, Routes } from "react-router-dom";

import { UserStoreProvider } from "./stores/UserStore";
import { ProductsStoreProvider } from "./stores/ProductsStore";
import { CSATStoreProvider } from "./stores/CSATStore";
import IndexPage from "./pages/IndexPage/IndexPage";

// Маршруты добавляются по мере переноса страниц с Tarakan на React
// (см. src/index.ts в истории git для полного списка).
function App() {
    return (
        <UserStoreProvider>
            <ProductsStoreProvider>
                <CSATStoreProvider>
                    <Routes>
                        <Route path="/" element={<IndexPage />} />
                        <Route
                            path="*"
                            element={<div>Bazaar — идёт миграция на React</div>}
                        />
                    </Routes>
                </CSATStoreProvider>
            </ProductsStoreProvider>
        </UserStoreProvider>
    );
}

export default App;
