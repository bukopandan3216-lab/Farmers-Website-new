import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PaymentModal } from "../components/PaymentModal";
import { orderApi } from "../services/api";
import { toast } from "sonner";
import {
  MapPin, Phone, User, ChevronRight, ShoppingBag,
  CheckCircle, Truck, CreditCard, ArrowLeft
} from "lucide-react";

type CheckoutStep = "cart-review" | "delivery" | "payment" | "confirmation";

interface DeliveryForm {
  fullName: string;
  phone: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  landmark: string;
  deliveryDate: string;
  deliveryNotes: string;
}

const STEP_CONFIG = [
  { id: "cart-review", label: "Review", icon: ShoppingBag },
  { id: "delivery",    label: "Delivery", icon: MapPin },
  { id: "payment",     label: "Payment", icon: CreditCard },
  { id: "confirmation",label: "Done", icon: CheckCircle },
] as const;

export function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>("cart-review");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [orderNumber, setOrderNumber] = useState(() => `FD-${Date.now().toString().slice(-6)}`);

  const deliveryFee = 60;
  const platformFee = Math.round(cartTotal * 0.04);
  const total = cartTotal + deliveryFee + platformFee;

  const [delivery, setDelivery] = useState<DeliveryForm>({
    fullName: user?.full_name ?? "",
    phone: "",
    address: "",
    barangay: "",
    city: "",
    province: "",
    landmark: "",
    deliveryDate: "",
    deliveryNotes: "",
  });

  const updateDelivery = (key: keyof DeliveryForm, value: string) =>
    setDelivery(prev => ({ ...prev, [key]: value }));

  const deliveryValid =
    delivery.fullName.trim() &&
    delivery.phone.trim() &&
    delivery.address.trim() &&
    delivery.city.trim() &&
    delivery.province.trim();

  const handlePaymentComplete = async (data: any) => {
    try {
      const order = await orderApi.create({
        items: cart.map((item) => ({ productId: item.id, quantity: item.qty })),
        deliveryAddress: `${delivery.address}${delivery.barangay ? `, ${delivery.barangay}` : ""}, ${delivery.city}, ${delivery.province}`,
      });
      setOrderNumber(order.id);
      setPaymentResult(data);
      setShowPaymentModal(false);
      setStep("confirmation");
      clearCart();
      toast.success("Order created successfully.");
    } catch {
      toast.error("Could not place order. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">Login Required</h1>
          <Link to="/login"><Button>Login Now</Button></Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step !== "confirmation") {
    return (
      <div className="min-h-screen bg-background py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">Your cart is empty</h1>
          <Link to="/shop"><Button>Browse Products</Button></Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEP_CONFIG.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center mb-10">
          {STEP_CONFIG.map((s, idx) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = idx < currentStepIndex;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-primary text-primary-foreground"
                        : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium ${
                      isActive ? "text-primary" : isDone ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEP_CONFIG.length - 1 && (
                  <div
                    className={`h-0.5 w-16 sm:w-24 mx-2 transition-all ${
                      idx < currentStepIndex ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">

            {/* Step 1: Cart Review */}
            {step === "cart-review" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                      <ImageWithFallback
                        src={item.photo}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl bg-muted"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.store_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.qty} × ₱{item.price}</p>
                      </div>
                      <div className="text-right font-semibold text-primary">
                        ₱{(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => setStep("delivery")} className="w-full mt-4">
                    Continue to Delivery <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Delivery Form */}
            {step === "delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={delivery.fullName}
                          onChange={e => updateDelivery("fullName", e.target.value)}
                          placeholder="Maria Santos"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={delivery.phone}
                          onChange={e => updateDelivery("phone", e.target.value)}
                          placeholder="+63 917 123 4567"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={delivery.address}
                        onChange={e => updateDelivery("address", e.target.value)}
                        placeholder="123 Rizal Street"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="barangay">Barangay</Label>
                      <Input
                        id="barangay"
                        value={delivery.barangay}
                        onChange={e => updateDelivery("barangay", e.target.value)}
                        placeholder="Barangay San Jose"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City / Municipality *</Label>
                      <Input
                        id="city"
                        value={delivery.city}
                        onChange={e => updateDelivery("city", e.target.value)}
                        placeholder="Quezon City"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="province">Province *</Label>
                      <Input
                        id="province"
                        value={delivery.province}
                        onChange={e => updateDelivery("province", e.target.value)}
                        placeholder="Metro Manila"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="landmark">Nearby Landmark</Label>
                      <Input
                        id="landmark"
                        value={delivery.landmark}
                        onChange={e => updateDelivery("landmark", e.target.value)}
                        placeholder="Near SM City"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="deliveryDate">Preferred Delivery Date</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={delivery.deliveryDate}
                        onChange={e => updateDelivery("deliveryDate", e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                        className="mt-1"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="notes">Delivery Notes</Label>
                      <textarea
                        id="notes"
                        value={delivery.deliveryNotes}
                        onChange={e => updateDelivery("deliveryNotes", e.target.value)}
                        placeholder="Special instructions for the delivery rider..."
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-input-background text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep("cart-review")} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button
                      onClick={() => setStep("payment")}
                      disabled={!deliveryValid}
                      className="flex-2 flex-grow"
                    >
                      Continue to Payment <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Delivery Summary */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Delivering to
                    </h3>
                    <p className="text-sm text-foreground font-medium">{delivery.fullName}</p>
                    <p className="text-sm text-muted-foreground">{delivery.address}{delivery.barangay ? `, ${delivery.barangay}` : ""}, {delivery.city}, {delivery.province}</p>
                    <p className="text-sm text-muted-foreground">{delivery.phone}</p>
                  </div>

                  <div className="bg-secondary/60 rounded-xl p-6 text-center mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Order Total</p>
                    <p className="text-4xl font-bold text-primary">₱{total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Includes ₱{deliveryFee} delivery + ₱{platformFee} platform fee
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground text-center mb-6">
                    Choose your preferred payment method to complete the order.
                  </p>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("delivery")} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex-grow"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Choose Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Confirmation */}
            {step === "confirmation" && (
              <Card>
                <CardContent className="pt-12 pb-10 text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-14 h-14 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Order Placed!</h2>
                  <p className="text-muted-foreground mb-1">Order Number</p>
                  <p className="text-2xl font-mono font-bold text-primary mb-6">{orderNumber}</p>

                  <div className="bg-muted/50 rounded-xl p-5 text-left mb-8 max-w-sm mx-auto">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="font-semibold capitalize">{paymentResult?.method === "cod" ? "Cash on Delivery" : paymentResult?.method?.toUpperCase() ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Payment Status</span>
                      <span className={`font-semibold capitalize ${paymentResult?.status === "paid" || paymentResult?.status === "verification_pending" ? "text-green-600" : "text-amber-600"}`}>
                        {paymentResult?.status === "verification_pending" ? "Verifying" : paymentResult?.status ?? "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery to</span>
                      <span className="font-semibold">{delivery.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
                    <Truck className="w-4 h-4 text-primary" />
                    Expected delivery in 1–3 business days
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/profile">
                      <Button variant="outline">View My Orders</Button>
                    </Link>
                    <Link to="/shop">
                      <Button>Continue Shopping</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== "confirmation" && (
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cart.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate flex-1 mr-2">
                        {item.name} × {item.qty}
                      </span>
                      <span className="font-medium text-foreground">₱{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  {cart.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{cart.length - 3} more items</p>
                  )}

                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₱{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>₱{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee (4%)</span>
                      <span>₱{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-xl font-bold text-primary">₱{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-secondary/60 rounded-lg p-3 mt-2">
                    <p className="text-xs text-muted-foreground text-center">
                      Secure checkout powered by FarmDirect
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          orderTotal={total}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
