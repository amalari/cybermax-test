import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = undefined> {
  @ApiProperty({
    description: 'The HTTP status code of the response',
    example: HttpStatus.OK,
  })
  status!: HttpStatus;

  @ApiProperty({
    description: 'A message providing additional details about the response',
    example: 'Operation successful',
  })
  message = '';

  data?: T;
}