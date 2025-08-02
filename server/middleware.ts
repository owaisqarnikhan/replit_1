import { Request, Response, NextFunction } from 'express';
import { userHasPermission } from './seed-permissions';

// Middleware to check if user has specific permission
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user has the required permission
    const hasPermission = await userHasPermission(req.user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}

// Middleware for Super Admin only access
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user?.isSuperAdmin) {
    return res.status(401).json({ message: "Super Admin access required" });
  }
  next();
}

// Middleware for Admin or Super Admin access (backward compatibility)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || (!req.user?.isAdmin && !req.user?.isSuperAdmin)) {
    return res.status(401).json({ message: "Admin access required" });
  }
  next();
}

// Middleware to check multiple permissions (user needs at least one)
export function requireAnyPermission(permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user has any of the required permissions
    for (const permission of permissions) {
      const hasPermission = await userHasPermission(req.user.id, permission);
      if (hasPermission) {
        return next();
      }
    }

    return res.status(403).json({ message: "Insufficient permissions" });
  };
}