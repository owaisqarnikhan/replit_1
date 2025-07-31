import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, X } from "lucide-react";

interface OrderApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTotal: string;
}

export function OrderApprovalModal({ isOpen, onClose, orderId, orderTotal }: OrderApprovalModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <AlertDialogTitle className="text-xl">Order Awaiting Approval</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left">
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 border-l-4 border-yellow-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Payment Locked Until Approval
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Your order has been submitted successfully but payment is currently locked until admin approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Order ID:</span>
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {orderId.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-semibold">${orderTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <span className="text-yellow-600 dark:text-yellow-400">Pending Approval</span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                What happens next?
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Admin will review your order request</li>
                <li>• You'll receive an email notification once approved</li>
                <li>• Payment will be unlocked after approval</li>
                <li>• Check your orders page for status updates</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center space-x-2 pt-4">
          <Button onClick={onClose} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Got it
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}