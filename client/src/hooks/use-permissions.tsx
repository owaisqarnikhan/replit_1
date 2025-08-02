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
  // Check for specific manager permissions (users.view, orders.view, settings.view)
  const hasManagerAccess = (): boolean => {
    // Manager role specifically has these permissions that regular users don't have
    const managerSpecificPermissions = [
      "users.view",     // Only managers and super admins can view users
      "orders.view",    // Only managers and super admins can view all orders (not just own)
      "settings.view"   // Only managers and super admins can view settings
    ];
    
    // If user has any of these specific manager permissions, they are a manager
    return hasAnyPermission(managerSpecificPermissions);
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