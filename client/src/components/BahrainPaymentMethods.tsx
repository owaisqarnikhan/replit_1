import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Banknote, Smartphone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export type PaymentMethod = "benefit_pay" | "cash_on_delivery" | "knet" | "benefit_debit" | "stripe";

interface BahrainPaymentMethodsProps {
  total: number;
  orderId: string;
  shippingData: any;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

export function BahrainPaymentMethods({
  total,
  orderId,
  shippingData,
  onPaymentSuccess,
  onPaymentError,
}: BahrainPaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("benefit_pay");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const paymentMethods = [
    {
      id: "benefit_pay" as PaymentMethod,
      name: "Benefit Pay",
      description: "Pay securely using Benefit Pay - Bahrain's leading payment gateway",
      icon: <Smartphone className="h-5 w-5" />,
      available: true,
    },
    {
      id: "cash_on_delivery" as PaymentMethod,
      name: "Cash on Delivery",
      description: "Pay when your order arrives at your doorstep",
      icon: <Banknote className="h-5 w-5" />,
      available: true,
    },
    {
      id: "knet" as PaymentMethod,
      name: "K-Net",
      description: "Pay using your Kuwaiti debit card (Available soon)",
      icon: <CreditCard className="h-5 w-5" />,
      available: false,
    },
    {
      id: "benefit_debit" as PaymentMethod,
      name: "Benefit Debit Card",
      description: "Pay using your Benefit debit card (Available soon)",
      icon: <Building2 className="h-5 w-5" />,
      available: false,
    },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (selectedMethod === "benefit_pay") {
        const response = await apiRequest("POST", "/api/benefit-pay/create", {
          amount: total,
          currency: "BHD",
          orderId,
          customerInfo: {
            name: `${shippingData.firstName} ${shippingData.lastName}`,
            email: shippingData.email,
            phone: shippingData.phone,
          },
        });

        const paymentData = await response.json();

        if (paymentData.paymentUrl) {
          // In a real implementation, you would redirect to Benefit Pay
          toast({
            title: "Redirecting to Benefit Pay",
            description: "You will be redirected to complete your payment",
          });
          
          // Simulate successful payment for demo
          setTimeout(() => {
            onPaymentSuccess({
              method: "benefit_pay",
              transactionId: paymentData.transactionId,
              amount: total,
            });
          }, 2000);
        }
      } else if (selectedMethod === "cash_on_delivery") {
        const response = await apiRequest("POST", "/api/cash-on-delivery", {
          orderId,
          amount: total,
          shippingAddress: shippingData,
        });

        const result = await response.json();

        if (result.success) {
          toast({
            title: "Order Confirmed",
            description: "Your cash on delivery order has been placed successfully",
          });

          onPaymentSuccess({
            method: "cash_on_delivery",
            orderId,
            amount: total,
          });
        }
      } else {
        toast({
          title: "Payment Method Unavailable",
          description: "This payment method is coming soon",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      onPaymentError(error.message || "Payment failed");
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Methods
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your preferred payment method for Bahrain
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
        >
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              } ${!method.available ? "opacity-50" : "cursor-pointer"}`}
            >
              <RadioGroupItem
                value={method.id}
                id={method.id}
                disabled={!method.available}
              />
              <Label
                htmlFor={method.id}
                className={`flex-1 cursor-pointer ${
                  !method.available ? "cursor-not-allowed" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                    {method.icon}
                  </div>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {method.description}
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold">
              {total.toFixed(2)} BHD
            </span>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing || !paymentMethods.find(m => m.id === selectedMethod)?.available}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : selectedMethod === "cash_on_delivery" ? (
              "Place Order (Cash on Delivery)"
            ) : (
              `Pay ${total.toFixed(2)} BHD`
            )}
          </Button>

          {selectedMethod === "cash_on_delivery" && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              You will pay {total.toFixed(2)} BHD when your order is delivered
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}