import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { NotifyService } from '../../notification/notification.public-api';

describe('ApprovalsService', () => {
  let service: ApprovalsService;
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock; findMany: jest.Mock } };
  let notify: { notifyUser: jest.Mock };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() } };
    notify = { notifyUser: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        ApprovalsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotifyService, useValue: notify },
      ],
    }).compile();

    service = module.get(ApprovalsService);
  });

  describe('decide', () => {
    it('throws NotFoundException for an unknown user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.decide('missing', 'APPROVED')).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('updates accountState to APPROVED and sends the account-approved template', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@example.com', accountState: 'APPROVED' });

      await service.decide('u1', 'APPROVED');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { accountState: 'APPROVED' },
      });
      expect(notify.notifyUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'u1' }),
        expect.objectContaining({ emailTemplateId: 'account-approved', type: 'APPROVAL' }),
      );
    });

    // Regression test: type is 'APPROVAL' for BOTH outcomes, so without an
    // explicit emailTemplateId override, EmailChannel's type-based lookup
    // would send the "approved" copy to a rejected applicant too.
    it('updates accountState to REJECTED and sends the account-rejected template, not account-approved', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u2' });
      prisma.user.update.mockResolvedValue({ id: 'u2', email: 'b@example.com', accountState: 'REJECTED' });

      await service.decide('u2', 'REJECTED');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u2' },
        data: { accountState: 'REJECTED' },
      });
      const [, payload] = notify.notifyUser.mock.calls[0];
      expect(payload.emailTemplateId).toBe('account-rejected');
      expect(payload.emailTemplateId).not.toBe('account-approved');
    });
  });

  describe('findPending', () => {
    it('queries only PENDING users with profile and department included', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      await service.findPending();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { accountState: 'PENDING' },
        include: { profile: true, department: true },
      });
    });
  });

  describe('findActive', () => {
    it('queries APPROVED and RESTRICTED users with profile and department included', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      await service.findActive();
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { accountState: { in: ['APPROVED', 'RESTRICTED'] } },
        include: { profile: true, department: true },
      });
    });
  });

  describe('restrict', () => {
    it('throws NotFoundException for an unknown user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.restrict('missing', 'reason')).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the user is not currently APPROVED', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', accountState: 'PENDING' });
      await expect(service.restrict('u1', 'reason')).rejects.toThrow(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('sets accountState to RESTRICTED, records the reason, and sends the account-restricted template', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', accountState: 'APPROVED' });
      prisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@example.com', accountState: 'RESTRICTED' });

      await service.restrict('u1', 'Repeated policy violations');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { accountState: 'RESTRICTED', restrictionReason: 'Repeated policy violations' },
      });
      expect(notify.notifyUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'u1' }),
        expect.objectContaining({ emailTemplateId: 'account-restricted', type: 'APPROVAL' }),
      );
    });
  });

  describe('restore', () => {
    it('throws NotFoundException for an unknown user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.restore('missing')).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the user is not currently RESTRICTED', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', accountState: 'APPROVED' });
      await expect(service.restore('u1')).rejects.toThrow(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('sets accountState back to APPROVED, clears the reason, and sends the account-restored template', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', accountState: 'RESTRICTED' });
      prisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@example.com', accountState: 'APPROVED' });

      await service.restore('u1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { accountState: 'APPROVED', restrictionReason: null },
      });
      expect(notify.notifyUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'u1' }),
        expect.objectContaining({ emailTemplateId: 'account-restored', type: 'APPROVAL' }),
      );
    });
  });
});
