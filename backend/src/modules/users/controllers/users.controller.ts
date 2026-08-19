import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AllowPendingAccount } from '../../../common/decorators/allow-pending-account.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpsertAddressDto } from '../dto/upsert-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';
import { SetPushTokenDto } from '../dto/set-push-token.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getProfile(user.id);
  }

  // Both routes are exempted from AccountStateGuard's approved-only check —
  // the signup wizard (screens 2-4: personal/academic/interests + avatar)
  // saves these right after registration, while the account is still
  // PENDING admin approval. Same pattern as auth.controller.ts's /me.
  @AllowPendingAccount()
  @Patch('me')
  updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @AllowPendingAccount()
  @Post('me/avatar')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(user.id, file.buffer);
  }

  @Patch('me/notification-preferences')
  updateNotificationPreferences(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.usersService.updateNotificationPreferences(user.id, dto);
  }

  @Get('me/address')
  listAddresses(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.listAddresses(user.id);
  }

  @Post('me/address')
  addAddress(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpsertAddressDto,
  ) {
    return this.usersService.addAddress(user.id, dto);
  }

  @Patch('me/address/:id')
  updateAddress(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(user.id, id, dto);
  }

  @Delete('me/address/:id')
  deleteAddress(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.usersService.deleteAddress(user.id, id);
  }

  @Post('me/address/:id/set-default')
  setDefaultAddress(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.usersService.setDefaultAddress(user.id, id);
  }

  @Post('me/push-token')
  setPushToken(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SetPushTokenDto,
  ) {
    return this.usersService.setPushToken(user.id, dto.token);
  }
}
