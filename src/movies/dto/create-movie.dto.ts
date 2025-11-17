import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(1888)
  @Max(3000)
  publishingYear: number;

  @IsOptional()
  @IsString()
  posterPath?: string;
}
