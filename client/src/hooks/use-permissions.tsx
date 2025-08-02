import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";

export interface PermissionsResponse {
  permissions: string[];
}

export function usePermissions() {
  const {
    data,
    isLoading,
    error,
  } = useQuery<PermissionsResponse, Error>({
    queryKey: ["/api/user/permissions"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 0, // Always refetch permissions to ensure fresh data
    refetchOnMount: true, // Refetch on component mount
  });

  const permissions = data?.permissions || [];

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => permissions.includes(permission));
  };

  // Check if user has manager role access
  // This is now a simpler check - if they have more than just basic user permissions, they're a manager
  const hasManagerAccess = (): boolean => {
    // Basic permissions that all users have
    const basicUserPermissions = [
      "auth.login", "auth.logout", "auth.session",
      "products.view", "categories.view", 
      "orders.view_own", "cart.view", "cart.add", "cart.update", "cart.remove", "cart.clear",
      "payment.stripe", "payment.paypal", "payment.benefit", "payment.cod", "payment.history",
      "profile.edit"
    ];
    
    // If user has permissions beyond basic user permissions, they are a manager
    const hasManagementPermissions = permissions.some(permission => 
      !basicUserPermissions.includes(permission) && 
      !permission.startsWith("orders.view_own") && 
      !permission.startsWith("cart.") &&
      !permission.startsWith("payment.") &&
      permission !== "profile.edit"
    );
    
    return hasManagementPermissions || permissions.includes("users.view") || permissions.includes("orders.view");
  };

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasManagerAccess,
  };
}