import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { hasAnyRole, UserRole } from '@psyapp/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: UserRole[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied');
    }
    const allowed = hasAnyRole(user.role as UserRole, this.allowedRoles);
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
