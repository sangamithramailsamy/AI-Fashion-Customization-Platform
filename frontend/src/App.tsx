import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { ShopProvider } from '@/context/ShopContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { CustomerProvider } from '@/context/CustomerContext';
import { OrderProvider } from '@/context/OrderContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ReviewProvider } from '@/context/ReviewContext';
import { CatalogProvider } from '@/context/CatalogContext';
import { OwnerAuthProvider } from '@/context/OwnerAuthContext';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import CollectionsPage from '@/pages/CollectionsPage';
import CollectionDetailPage from '@/pages/CollectionDetailPage';
import NewArrivalsPage from '@/pages/NewArrivalsPage';
import CustomDesignsPage from '@/pages/CustomDesignsPage';
import AIDesignStudioPage from '@/pages/AIDesignStudioPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import WishlistPage from '@/pages/WishlistPage';
import CheckoutPage from '@/pages/CheckoutPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import AccountLayout from '@/layouts/AccountLayout';
import AccountOverviewPage from '@/pages/AccountOverviewPage';
import AccountProfilePage from '@/pages/AccountProfilePage';
import AccountMeasurementsPage from '@/pages/AccountMeasurementsPage';
import AccountAddressesPage from '@/pages/AccountAddressesPage';
import AccountOrdersPage from '@/pages/AccountOrdersPage';
import OrderDetailsPage from '@/pages/OrderDetailsPage';
import OrderTrackingPage from '@/pages/OrderTrackingPage';
import AccountWishlistPage from '@/pages/AccountWishlistPage';
import AccountNotificationsPage from '@/pages/AccountNotificationsPage';
import AccountReviewsPage from '@/pages/AccountReviewsPage';
import WriteReviewPage from '@/pages/WriteReviewPage';
import OwnerLoginPage from '@/pages/OwnerLoginPage';
import OwnerLayout from '@/layouts/OwnerLayout';
import OwnerDashboardPage from '@/pages/OwnerDashboardPage';
import BoutiqueManagementPage from '@/pages/BoutiqueManagementPage';
import OwnerProductsPage from '@/pages/OwnerProductsPage';
import OwnerOrdersPage from '@/pages/OwnerOrdersPage';
import OwnerOrderDetailsPage from '@/pages/OwnerOrderDetailsPage';
import CustomerManagementPage from '@/pages/CustomerManagementPage';
import EmployeeManagementPage from '@/pages/EmployeeManagementPage';
import InventoryManagementPage from '@/pages/InventoryManagementPage';
import ProductionManagementPage from '@/pages/ProductionManagementPage';
import PaymentManagementPage from '@/pages/PaymentManagementPage';
import ReviewModerationPage from '@/pages/ReviewModerationPage';
import NotificationManagementPage from '@/pages/NotificationManagementPage';
import ReportsPage from '@/pages/ReportsPage';
import { CustomerProtectedRoute, OwnerProtectedRoute } from '@/components/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CustomerProvider>
            <OrderProvider>
              <NotificationProvider>
                <ReviewProvider>
                  <CatalogProvider>
                    <ShopProvider>
                      <OwnerAuthProvider>
                      <BrowserRouter>
                        <Routes>
                          <Route element={<RootLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/shop" element={<ShopPage />} />
                            <Route path="/collections" element={<CollectionsPage />} />
                            <Route path="/collections/:slug" element={<CollectionDetailPage />} />
                            <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                            <Route path="/custom-designs" element={<CustomDesignsPage />} />
                            <Route path="/ai-design-studio" element={<AIDesignStudioPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/product/:id" element={<ProductDetailPage />} />
                            <Route path="/cart" element={<CustomerProtectedRoute><CartPage /></CustomerProtectedRoute>} />
                            <Route path="/wishlist" element={<CustomerProtectedRoute><WishlistPage /></CustomerProtectedRoute>} />
                            <Route path="/checkout" element={<CustomerProtectedRoute><CheckoutPage /></CustomerProtectedRoute>} />
                            <Route path="/order-confirmation/:id" element={<CustomerProtectedRoute><OrderConfirmationPage /></CustomerProtectedRoute>} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/account" element={<CustomerProtectedRoute><AccountLayout /></CustomerProtectedRoute>}>
                              <Route index element={<AccountOverviewPage />} />
                              <Route path="profile" element={<AccountProfilePage />} />
                              <Route path="measurements" element={<AccountMeasurementsPage />} />
                              <Route path="addresses" element={<AccountAddressesPage />} />
                              <Route path="orders" element={<AccountOrdersPage />} />
                              <Route path="orders/:id" element={<OrderDetailsPage />} />
                              <Route path="orders/:id/track" element={<OrderTrackingPage />} />
                              <Route path="wishlist" element={<AccountWishlistPage />} />
                              <Route path="notifications" element={<AccountNotificationsPage />} />
                              <Route path="reviews" element={<AccountReviewsPage />} />
                              <Route path="reviews/write" element={<WriteReviewPage />} />
                            </Route>
                            {/* Owner / Admin portal (Phase 5A + 5B) */}
                            <Route path="/owner/login" element={<OwnerLoginPage />} />
                            <Route path="/owner" element={<OwnerProtectedRoute><OwnerLayout /></OwnerProtectedRoute>}>
                              <Route index element={<OwnerDashboardPage />} />
                              <Route path="boutique" element={<BoutiqueManagementPage />} />
                              <Route path="products" element={<OwnerProductsPage />} />
                              <Route path="orders" element={<OwnerOrdersPage />} />
                              <Route path="orders/:id" element={<OwnerOrderDetailsPage />} />
                              <Route path="customers" element={<CustomerManagementPage />} />
                              <Route path="employees" element={<EmployeeManagementPage />} />
                              <Route path="inventory" element={<InventoryManagementPage />} />
                              <Route path="production" element={<ProductionManagementPage />} />
                              <Route path="payments" element={<PaymentManagementPage />} />
                              <Route path="reviews" element={<ReviewModerationPage />} />
                              <Route path="notifications" element={<NotificationManagementPage />} />
                              <Route path="reports" element={<ReportsPage />} />
                            </Route>
                          </Route>
                        </Routes>
                      </BrowserRouter>
                    </OwnerAuthProvider>
                    </ShopProvider>
                  </CatalogProvider>
                </ReviewProvider>
              </NotificationProvider>
            </OrderProvider>
          </CustomerProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
