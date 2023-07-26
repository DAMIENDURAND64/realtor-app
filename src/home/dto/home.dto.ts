import { PropertyType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HomeResponseDto {
  id: number;
  address: string;
  city: string;
  price: number;
  propertyType: PropertyType;

  @Exclude()
  number_of_bedrooms: number;
  @Expose({ name: 'numberOfBedrooms' })
  numberOfBedrooms() {
    return this.number_of_bedrooms;
  }

  @Exclude()
  number_of_bathrooms: number;
  @Expose({ name: 'numberOfBathrooms' })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }

  @Exclude()
  listed_date: Date;
  @Exclude()
  land_size: number;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
  @Exclude()
  realtor_id: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  numberOfBedrooms: number;

  @IsNumber()
  @IsNotEmpty()
  numberOfBathrooms: number;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsNumber()
  @IsNotEmpty()
  landSize: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  image: Image[];
}

export class UpdateHomeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  numberOfBedrooms?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  numberOfBathrooms?: number;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  landSize?: number;
}

export class InquireDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
