import { ApiProperty } from '@nestjs/swagger';
import { type createLocationSchemaType } from '@cybermax-test-1/validator';
import { ContainsDash } from '../validator/contains-dash.validator';
import { IsNumber, IsString } from 'class-validator';

export class CreateLocationDto implements createLocationSchemaType {
  @ApiProperty({ 
    description: 'The area property in square meters.', 
    example: 80620 
  })
  @IsNumber()
  area?: number | undefined;

  @ApiProperty({ 
    description: 'The name property for location name', 
    example: "Car Park" 
  })
  @IsString()
  name!: string;

  @ApiProperty({ 
    description: 'The number property is code to identifier for the location with dash as a flag to identify the level', 
    example: "A-CarPark" 
  })
  @IsString()
  @ContainsDash({ message: 'Location number must contain at least one dash (-).' })
  number!: string;
}