import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreatePatientDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-\(\)]{7,20}$/, { message: 'Invalid phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string; // ISO date string

  @IsOptional()
  @IsString()
  gender?: string; // e.g., 'male', 'female', 'non_binary', 'prefer_not_to_say'
}