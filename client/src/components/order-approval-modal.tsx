import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";

interface OrderApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTotal: string;
}

export function OrderApprovalModal({ isOpen, onClose, orderId, orderTotal }: OrderApprovalModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Order Submitted",
      description: "Your order has been successfully submitted",
      status: "completed",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      id: 2,
      title: "Awaiting Admin Approval",
      description: "Your order is being reviewed by our admin team",
      status: "current",
      icon: <Clock className="h-5 w-5" />
    },
    {
      id: 3,
      title: "Payment Processing",
      description: "Complete payment after approval",
      status: "pending",
      icon: <AlertCircle className="h-5 w-5" />
    }
  ];

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "current":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Order Approval Process</DialogTitle>
          <DialogDescription className="text-center">
            Your order #{orderId.slice(-8).toUpperCase()} is now in the approval workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">#{orderId.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg">${orderTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Process Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full border-2 ${getStepColor(step.status)}`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{step.title}</h3>
                        <Badge variant={step.status === "completed" ? "default" : step.status === "current" ? "secondary" : "outline"}>
                          {step.status === "completed" ? "Done" : step.status === "current" ? "In Progress" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400 mt-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">Important Notice</h4>
                <div className="text-sm text-amber-700 mt-1 space-y-1">
                  <p>• Payment methods are currently locked until admin approval</p>
                  <p>• You will receive an email notification once your order is approved</p>
                  <p>• Admin review typically takes 24 hours or less</p>
                  <p>• You can track your order status in "My Orders" section</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-800">Email Confirmation Sent</h4>
                <p className="text-sm text-blue-700 mt-1">
                  A confirmation email has been sent to your registered email address with order details and next steps.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.location.href = '/orders'}>
            View My Orders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}