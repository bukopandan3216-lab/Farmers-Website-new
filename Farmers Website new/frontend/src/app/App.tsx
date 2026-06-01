import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { ApplyPage } from "./pages/ApplyPage";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { CartPage } from "./pages/CartPage";
import { StoresPage } from "./pages/StoresPage";
import { FarmerStorePage } from "./pages/FarmerStorePage";
import { MessagesPage } from "./pages/MessagesPage";
import { FarmerDashboard } from "./pages/FarmerDashboard";
import { BuyerProfilePage } from "./pages/BuyerProfilePage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminApplicationsPage } from "./pages/AdminApplicationsPage";
import { CheckoutPage } from "./pages/CheckoutPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/create-account/:applicationId" element={<CreateAccountPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route
              path="/*"
              element={
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/apply" element={<ApplyPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/stores" element={<StoresPage />} />
                      <Route path="/store/:storeId" element={<FarmerStorePage />} />
                      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                      <Route path="/messages/:otherUserId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                      <Route path="/farmer-dashboard" element={<ProtectedRoute roles={["FARMER"]}><FarmerDashboard /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><BuyerProfilePage /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
                      <Route path="/admin/applications" element={<ProtectedRoute roles={["ADMIN"]}><AdminApplicationsPage /></ProtectedRoute>} />
                      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
