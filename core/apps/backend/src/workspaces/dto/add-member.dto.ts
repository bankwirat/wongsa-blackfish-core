import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Member role',
    example: 'member',
    enum: ['owner', 'admin', 'member'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['owner', 'admin', 'member'])
  role?: string;
}
