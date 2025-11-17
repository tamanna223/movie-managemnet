import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie, MovieDocument } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name)
    private readonly movieModel: Model<MovieDocument>,
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const created = new this.movieModel(createMovieDto);
    return created.save();
  }

  async findAll(page = 1, limit = 10): Promise<{ data: Movie[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.movieModel.find().skip(skip).limit(limit).exec(),
      this.movieModel.countDocuments().exec(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.movieModel.findById(id).exec();
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.movieModel
      .findByIdAndUpdate(id, { $set: updateMovieDto }, { new: true })
      .exec();
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  async remove(id: string): Promise<void> {
    const res = await this.movieModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Movie not found');
    }
  }

  async setPoster(id: string, posterPath: string): Promise<Movie> {
    const movie = await this.movieModel
      .findByIdAndUpdate(id, { $set: { posterPath } }, { new: true })
      .exec();
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }
}
