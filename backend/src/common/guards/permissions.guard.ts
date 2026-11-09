import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { CurrentUserPayload } from '../decorators/current-user.decorator';
import { PrismaService } from '../../database/postgres/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUserPayload | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('User session required');
    }

    // 1. Super Admins bypass all dynamic permissions checks
    if (user.role === 'superadmin') {
      return true;
    }

    // 2. Bookshop Owners (seller role) bypass permission checks for local shop tasks
    if (user.role === 'seller') {
      return true;
    }

    // 3. For dynamic Staff members, we verify their role Record permissions in DB
    if (user.role === 'staff') {
      // Find the user with their dynamic role record and loaded permissions
      const staffUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          roleRecord: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!staffUser || !staffUser.roleRecord) {
        throw new ForbiddenException('No dynamic role record assigned');
      }

      // Check if user's dynamic role permissions include the required action
      const hasPermission = staffUser.roleRecord.permissions.some(
        (rp) => rp.permission.action === requiredPermission,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Missing required permission: ${requiredPermission}`,
        );
      }

      return true;
    }

    // Default reject
    throw new ForbiddenException('Role not authorized');
  }
}
