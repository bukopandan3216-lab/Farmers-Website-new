import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, ShoppingCart, LogOut, MessageCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const getUserDashboard = () => {
    if (!user) return "/login";
    if (user.role === "FARMER") return "/farmer-dashboard";
    if (user.role === "BUYER") return "/profile";
    if (user.role === "ADMIN") return "/admin";
    return "/login";
  };

  return (
    <header className="border-b border-border sticky top-0 bg-white/95 backdrop-blur z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              🌾
            </div>
            <span className="text-xl font-bold hidden sm:block text-emerald-600">FarmDirect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/shop" className="hover:text-emerald-600 transition-colors font-medium">Shop All</Link>
            <Link to="/stores" className="hover:text-emerald-600 transition-colors font-medium">Stores</Link>
            <Link to="/about" className="hover:text-emerald-600 transition-colors font-medium">About</Link>
            <Link to="/contact" className="hover:text-emerald-600 transition-colors font-medium">Contact</Link>
          </nav>

          <form onSubmit={handleSearch} className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products, farmers, or stores..."
                className="pl-10 border-gray-300 focus:border-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/messages">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Messages"
                    className="hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to={getUserDashboard()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title={user?.fullName}
                    className="hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                {user?.role === "BUYER" && (
                  <Link to="/cart">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative hover:text-emerald-600 hover:bg-emerald-50"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  title="Logout"
                  className="hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
