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
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
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

class CreateSchoolDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;
}

class CreateDepartmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;
}

class CreateLevelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;
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
  setRolePermissions(@Param('id') id: string, @Body() dto: SetRolePermissionsDto) {
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
    return this.superAdminService.createStaff(dto.email, dto.fullName, passwordHash, dto.roleId);
  }

  // --- Schools, Departments, Levels (Global management) ---
  @Get('schools')
  getSchools() {
    return this.superAdminService.getSchools();
  }

  @Post('schools')
  createSchool(@Body() dto: CreateSchoolDto) {
    return this.superAdminService.createSchool(dto.name);
  }

  @Delete('schools/:id')
  deleteSchool(@Param('id') id: string) {
    return this.superAdminService.deleteSchool(id);
  }

  @Post('schools/:id/departments')
  createDepartment(@Param('id') schoolId: string, @Body() dto: CreateDepartmentDto) {
    return this.superAdminService.createDepartment(schoolId, dto.name);
  }

  @Delete('departments/:id')
  deleteDepartment(@Param('id') id: string) {
    return this.superAdminService.deleteDepartment(id);
  }

  @Get('levels')
  getLevels() {
    return this.superAdminService.getLevels();
  }

  @Post('levels')
  createLevel(@Body() dto: CreateLevelDto) {
    return this.superAdminService.createLevel(dto.name);
  }

  @Delete('levels/:id')
  deleteLevel(@Param('id') id: string) {
    return this.superAdminService.deleteLevel(id);
  }
}
