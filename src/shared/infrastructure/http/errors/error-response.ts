import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({
    example: 'https://errors.yourdomain.com/problem-type',
  })
  type: string;

  @ApiProperty({ example: 'Problem title' })
  title: string;

  @ApiProperty({ example: 400 })
  status: number;

  @ApiProperty({
    example: 'Human-readable explanation of the problem.',
  })
  detail: string;

  @ApiProperty({ example: '/api/v1/templates/namespace:name' })
  instance?: string;

  @ApiProperty({
    required: false,
    example: 'd7a82b90-a886-4d30-a321-e9b4c835ecad',
  })
  transactionId?: string;

  @ApiProperty({
    required: false,
    example: [
      'complexId: must be in format "namespace:name:language" or "namespace:name"',
    ],
  })
  errors?: string[];
}
