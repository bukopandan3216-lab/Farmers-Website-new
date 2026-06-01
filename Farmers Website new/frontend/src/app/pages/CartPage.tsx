import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const deliveryFee = 50;
  const total = cartTotal + deliveryFee;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view and manage your cart.
          </p>
          <Link to="/login">
            <Button size="lg">Login Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role === "FARMER") {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="mb-4">Farmers Can't Buy</h1>
          <p className="text-muted-foreground">
            Your account is registered as a farmer. Only buyers can shop on FarmDirect.
          </p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add fresh produce from our farmers to get started!
          </p>
          <Link to="/shop">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="mb-4">Cart Items ({cartCount})</h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-border last:border-0"
                  >
                    <ImageWithFallback
                      src={item.photo}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="font-medium mb-1">{item.name}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {item.store_name} • ₱{Number(item.price || 0).toFixed(2)}/{item.unit}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-medium text-primary mb-2">
                        ₱{Number((item.price || 0) * (item.qty || 0)).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₱{Number(cartTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₱{Number(deliveryFee || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-medium text-primary">
                    ₱{Number(total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => navigate("/checkout")}
                className="w-full mb-3 bg-primary hover:bg-primary/90"
              >
                Proceed to Checkout →
              </Button>

              <Link to="/shop">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
