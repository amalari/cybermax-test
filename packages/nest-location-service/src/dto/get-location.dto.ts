import { schema } from "@cybermax-test-1/database";
import { ApiProperty } from "@nestjs/swagger";

export class GetLocationDto implements Omit<schema.SelectLocation, 'parentId' | 'level'> {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  building!: string;

  @ApiProperty()
  area!: string;

  @ApiProperty()
  number!: string
}