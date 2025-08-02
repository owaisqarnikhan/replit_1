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
  // Only check for create, edit, delete, and management permissions - not view permissions that customers also have
  const hasManagerAccess = (): boolean => {
    const adminPermissions = [
      "users.create", "users.edit", "users.delete", "users.manage",
      "products.create", "products.edit", "products.delete", "products.manage", "products.featured", "products.pricing",
      "categories.create", "categories.edit", "categories.delete", "categories.manage",
      "orders.edit", "orders.delete", "orders.manage", "orders.approve", "orders.reject", "orders.process", "orders.complete",
      "settings.edit", "settings.manage", "settings.smtp", "settings.footer",
      "roles.create", "roles.edit", "roles.delete", "roles.manage", "roles.assign", "roles.permissions",
      "email.edit", "email.manage", "email.test", "email.send", "email.notifications",
      "media.upload", "media.delete", "media.manage",
      "slider.create", "slider.edit", "slider.delete", "slider.manage", "slider.order",
      "units.create", "units.edit", "units.delete", "units.manage",
      "reports.export", "reports.analytics", "reports.manage", "reports.statistics",
      "database.export", "database.import", "database.backup", "database.restore", "database.excel"
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