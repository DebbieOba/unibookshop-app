import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { UploadService } from '../../../integrations/object-storage/upload.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: { update: jest.Mock };
    profile: { update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: { update: jest.fn() },
      profile: { update: jest.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: UploadService, useValue: { uploadImage: jest.fn() } },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('updateProfile', () => {
    it('updates matricNumber on User alongside the Profile fields', async () => {
      prisma.user.update.mockResolvedValue({});
      prisma.profile.update.mockResolvedValue({ id: 'p1', fullName: 'Test' });

      await service.updateProfile('user-1', { matricNumber: 'EEE/34/1234' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          departmentId: undefined,
          levelId: undefined,
          matricNumber: 'eee/34/1234',
        },
      });
    });

    it('surfaces a 409 ConflictException when the matric number is already taken', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: 'test',
        },
      );
      prisma.user.update.mockRejectedValue(p2002);

      await expect(
        service.updateProfile('user-1', { matricNumber: 'EEE/34/1234' }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.profile.update).not.toHaveBeenCalled();
    });

    it('rethrows unrelated errors instead of masking them as a conflict', async () => {
      prisma.user.update.mockRejectedValue(new Error('connection lost'));
      await expect(
        service.updateProfile('user-1', { matricNumber: 'EEE/34/1234' }),
      ).rejects.toThrow('connection lost');
    });

    it('does not touch User at all when neither department, level, nor matricNumber changed', async () => {
      prisma.profile.update.mockResolvedValue({ id: 'p1' });
      await service.updateProfile('user-1', { fullName: 'New Name' });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
