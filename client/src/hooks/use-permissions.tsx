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
  });

  const permissions = data?.permissions || [];

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => permissions.includes(permission));
  };

  // Check if user has any admin-level permissions (to show Manager Panel)
  const hasManagerAccess = (): boolean => {
    const adminPermissions = [
      "users.view", "users.create", "users.edit", "users.delete", "users.full",
      "products.view", "products.create", "products.edit", "products.delete", "products.full",
      "categories.view", "categories.create", "categories.edit", "categories.delete", "categories.full",
      "orders.view", "orders.create", "orders.edit", "orders.delete", "orders.full", "orders.approve",
      "settings.view", "settings.edit", "settings.full",
      "roles.view", "roles.create", "roles.edit", "roles.delete", "roles.full"
    ];
    
    return hasAnyPermission(adminPermissions);
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