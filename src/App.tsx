import { Route, Routes } from "react-router-dom";

import { UserStoreProvider } from "./stores/UserStore";
import { ProductsStoreProvider } from "./stores/ProductsStore";
import IndexPage from "./pages/IndexPage/IndexPage";
import ProductPage from "./pages/ProductPage/ProductPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import SearchPage from "./pages/SearchPage/SearchPage";
import CartPage from "./pages/CartPage/CartPage";
import PlaceOrderPage from "./pages/PlaceOrderPage/PlaceOrderPage";
import OrdersPage from "./pages/OrdersPage/OrdersPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage";
import SellerFormPage from "./pages/SellerFormPage/SellerFormPage";
import SellerPage from "./pages/SellerPage/SellerPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import WarehousePage from "./pages/WarehousePage/WarehousePage";

// Маршруты добавляются по мере переноса страниц с Tarakan на React
// (см. src/index.ts в истории git для полного списка).
function App() {
    return (
        <UserStoreProvider>
            <ProductsStoreProvider>
                <Routes>
                    <Route path="/" element={<IndexPage />} />
                    <Route
                        path="/product/:productId"
                        element={<ProductPage />}
                    />
                    <Route path="/signup" element={<RegisterPage />} />
                    <Route path="/signin" element={<LoginPage />} />
                    <Route path="/category/:id" element={<CategoryPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route
                        path="/place-order"
                        element={<PlaceOrderPage />}
                    />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route
                        path="/notifications"
                        element={<NotificationsPage />}
                    />
                    <Route
                        path="/seller-form"
                        element={<SellerFormPage />}
                    />
                    <Route path="/seller" element={<SellerPage />} />
                    <Route path="/admin/:tab" element={<AdminPage />} />
                    <Route path="/warehouse" element={<WarehousePage />} />
                    <Route
                        path="*"
                        element={<div>Bazaar — идёт миграция на React</div>}
                    />
                </Routes>
            </ProductsStoreProvider>
        </UserStoreProvider>
    );
}

export default App;
