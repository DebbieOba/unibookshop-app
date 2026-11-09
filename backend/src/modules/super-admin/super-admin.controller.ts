import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import * as argon2 from 'argon2';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SuperAdminService } from './super-admin.service';

class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

class SetRolePermissionsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  permissionIds!: string[];
}

class CreateStaffDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roleId!: string;
}


@ApiTags('super-admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('superadmin')
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // --- Dynamic Roles ---
  @Get('roles')
  getRoles() {
    return this.superAdminService.getRoles();
  }

  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) {
    return this.superAdminService.createRole(dto.name, dto.description);
  }

  @Put('roles/:id/permissions')
  setRolePermissions(
    @Param('id') id: string,
    @Body() dto: SetRolePermissionsDto,
  ) {
    return this.superAdminService.setRolePermissions(id, dto.permissionIds);
  }

  // --- Permissions ---
  @Get('permissions')
  getPermissions() {
    return this.superAdminService.getPermissions();
  }

  // --- Staff Management ---
  @Get('staff')
  getStaff() {
    return this.superAdminService.getStaff();
  }

  @Post('staff')
  async createStaff(@Body() dto: CreateStaffDto) {
    const passwordHash = await argon2.hash(dto.password);
    return this.superAdminService.createStaff(
      dto.email,
      dto.fullName,
      passwordHash,
      dto.roleId,
    );
  }

}
