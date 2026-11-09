import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { UploadService } from '../../../integrations/object-storage/upload.service';
import { RedisService } from '../../../database/redis/redis.service';

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
        { provide: RedisService, useValue: { keys: jest.fn().mockResolvedValue([]), del: jest.fn() } },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('updateProfile', () => {
    it('updates Profile fields', async () => {
      prisma.profile.update.mockResolvedValue({ id: 'p1' });
      await service.updateProfile('user-1', { fullName: 'New Name' });
      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { fullName: 'New Name' },
        include: { user: expect.any(Object) },
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
