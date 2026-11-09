import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/postgres/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Dynamic Roles ---
  async getRoles() {
    return this.prisma.roleRecord.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRole(name: string, description?: string) {
    const existing = await this.prisma.roleRecord.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException('Role name already exists');
    }
    return this.prisma.roleRecord.create({
      data: { name, description },
    });
  }

  async setRolePermissions(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.roleRecord.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permId) => ({
            roleId,
            permissionId: permId,
          })),
        });
      }

      return tx.roleRecord.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });
  }

  // --- Permissions ---
  async getPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { action: 'asc' },
    });
  }

  // --- Staff Management ---
  async getStaff() {
    return this.prisma.user.findMany({
      where: { role: 'staff' },
      include: {
        roleRecord: true,
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(
    email: string,
    fullName: string,
    passwordHash: string,
    roleId: string,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const roleRecord = await this.prisma.roleRecord.findUnique({
      where: { id: roleId },
    });
    if (!roleRecord) {
      throw new NotFoundException('Dynamic role not found');
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'staff',
        accountState: 'APPROVED',
        roleId,
        profile: {
          create: { fullName },
        },
      },
      include: {
        roleRecord: true,
        profile: true,
      },
    });
  }

}
