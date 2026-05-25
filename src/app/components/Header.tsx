import { Link } from "react-router-dom";
import { Search, User, ShoppingCart, LogOut, MessageCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const getUserDashboard = () => {
    if (!user) return "/login";
    if (user.role === "farmer") return "/farmer-dashboard";
    if (user.role === "buyer") return "/profile";
    if (user.role === "admin") return "/admin";
    return "/login";
  };

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              🌾
            </div>
            <span className="text-xl hidden sm:block">FarmDirect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/shop" className="hover:text-primary transition-colors">Shop All</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/messages">
                  <Button variant="ghost" size="icon" title="Messages">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to={getUserDashboard()}>
                  <Button variant="ghost" size="icon" title={user?.full_name}>
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                {user?.role === "buyer" && (
                  <Link to="/cart">
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
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
