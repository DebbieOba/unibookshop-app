import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { AllowPendingAccount } from '../../../common/decorators/allow-pending-account.decorator';
import { CurrentUser, type CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'List all registered bookshops' })
  @Get('bookshops')
  listBookshops() {
    return this.authService.listBookshops();
  }

  @Public()
  @ApiOperation({ summary: 'Register a new student account (starts PENDING)' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Log in with email/matric + password (works for any account state)' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@CurrentUser() user: any) {
    return this.authService.login(user);
  }

  @Public()
  @ApiOperation({ summary: 'Exchange a refresh token for a new access/refresh pair' })
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @AllowPendingAccount()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current session' })
  @Post('logout')
  logout(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.logout(user.id);
  }

  @AllowPendingAccount()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user — also used to poll approval status' })
  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return user;
  }

  @Public()
  @ApiOperation({ summary: 'Request a password reset email' })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @ApiOperation({ summary: 'Reset password using a forgot-password token' })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password while authenticated (requires current password)' })
  @Post('change-password')
  changePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }
}
