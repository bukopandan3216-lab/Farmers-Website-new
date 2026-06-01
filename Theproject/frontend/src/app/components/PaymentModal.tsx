import { useState } from "react";
import { X, Upload, CheckCircle, Clock, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PaymentModalProps {
  orderTotal: number;
  onClose: () => void;
  onPaymentComplete: (paymentData: any) => void;
}

export function PaymentModal({ orderTotal, onClose, onPaymentComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "paymaya" | "cod" | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [payLater, setPayLater] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "cod" || payLater) {
      // COD or Pay Later - No screenshot needed
      setShowSuccess(true);
      setTimeout(() => {
        onPaymentComplete({
          method: payLater ? "pending" : paymentMethod,
          status: payLater ? "pending_payment" : "paid",
          screenshot: null,
        });
      }, 2000);
    } else if (paymentScreenshot) {
      // GCash/PayMaya - Screenshot required
      setShowSuccess(true);
      setTimeout(() => {
        onPaymentComplete({
          method: paymentMethod,
          status: "verification_pending",
          screenshot: previewUrl,
        });
      }, 2000);
    }
  };

  const canProceed = paymentMethod === "cod" || payLater || (paymentMethod && paymentScreenshot);

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-md p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            {paymentMethod === "cod"
              ? "Your order has been placed. Pay upon delivery."
              : payLater
              ? "Your order is pending payment. Complete payment to proceed."
              : "Your payment is being verified. You'll receive a confirmation soon."}
          </p>
          <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Total */}
          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-700 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-emerald-900">₱{orderTotal.toLocaleString()}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Select Payment Method</h3>
            <div className="grid grid-cols-1 gap-3">
              {/* GCash */}
              <button
                onClick={() => {
                  setPaymentMethod("gcash");
                  setPayLater(false);
                }}
                className={`p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${
                  paymentMethod === "gcash"
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  G
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">GCash</p>
                  <p className="text-sm text-gray-500">Pay via GCash wallet</p>
                </div>
                {paymentMethod === "gcash" && (
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* PayMaya */}
              <button
                onClick={() => {
                  setPaymentMethod("paymaya");
                  setPayLater(false);
                }}
                className={`p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${
                  paymentMethod === "paymaya"
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                  PM
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">PayMaya</p>
                  <p className="text-sm text-gray-500">Pay via PayMaya wallet</p>
                </div>
                {paymentMethod === "paymaya" && (
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* Cash on Delivery */}
              <button
                onClick={() => {
                  setPaymentMethod("cod");
                  setPayLater(false);
                }}
                className={`p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${
                  paymentMethod === "cod"
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when you receive the order</p>
                </div>
                {paymentMethod === "cod" && (
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Upload Screenshot for GCash/PayMaya */}
          {(paymentMethod === "gcash" || paymentMethod === "paymaya") && !payLater && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Upload Payment Screenshot</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                {previewUrl ? (
                  <div className="relative">
                    <ImageWithFallback
                      src={previewUrl}
                      alt="Payment screenshot"
                      className="mx-auto max-h-64 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setPaymentScreenshot(null);
                        setPreviewUrl("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">Click to upload payment screenshot</p>
                    <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>{paymentMethod === "gcash" ? "GCash" : "PayMaya"} Payment Instructions:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
                  <li>Open your {paymentMethod === "gcash" ? "GCash" : "PayMaya"} app</li>
                  <li>Send ₱{orderTotal.toLocaleString()} to: 0917-123-4567</li>
                  <li>Take a screenshot of the payment confirmation</li>
                  <li>Upload the screenshot above</li>
                </ol>
              </div>
            </div>
          )}

          {/* Pay Later Option */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={payLater}
                onChange={(e) => {
                  setPayLater(e.target.checked);
                  if (e.target.checked) {
                    setPaymentMethod(null);
                  }
                }}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">Pay Later (Pending Payment)</span>
              </div>
            </label>
            {payLater && (
              <p className="text-sm text-orange-600 mt-2 ml-8">
                Your order will be placed with "Pending Payment" status. Complete payment within 24 hours.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!canProceed}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {payLater ? "Place Order (Pay Later)" : "Complete Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
