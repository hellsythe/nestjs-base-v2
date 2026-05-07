import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  current_page!: number;

  @ApiProperty({ example: 10 })
  per_page!: number;

  @ApiProperty({ example: 35 })
  total!: number;

  @ApiProperty({ example: 4 })
  last_page!: number;

  @ApiProperty({ example: 1 })
  from!: number;

  @ApiProperty({ example: 10 })
  to!: number;
}
