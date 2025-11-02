import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({
    description: 'Workspace name',
    example: 'Acme Inc',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Workspace name must be at least 2 characters' })
  @MaxLength(100, { message: 'Workspace name must be less than 100 characters' })
  name!: string;

  @ApiProperty({
    description: 'Workspace slug (URL-friendly identifier)',
    example: 'acme-inc',
    minLength: 2,
    maxLength: 50,
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Workspace slug must be at least 2 characters' })
  @MaxLength(50, { message: 'Workspace slug must be less than 50 characters' })
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
  slug!: string;

  @ApiProperty({
    description: 'Workspace description',
    example: 'Main company workspace for all our projects',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must be less than 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Workspace active status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
