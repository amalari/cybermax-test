import { ApiProperty } from "@nestjs/swagger";
import { GetLocationDto } from "./get-location.dto";
import { ResponseDto } from "./response.dto";

export class GetLocationResDto extends ResponseDto<GetLocationDto>{
  @ApiProperty({
    description: 'The data payload of the response',
    type: GetLocationDto,
    required: false,
  })
  override data!: GetLocationDto
}