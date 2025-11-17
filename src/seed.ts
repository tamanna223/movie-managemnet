import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { MoviesService } from './movies/movies.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);
  const moviesService = app.get(MoviesService);

  const email = 'test@example.com';
  const password = 'password123';

  // Create default user if it does not exist
  let user = await usersService.findByEmail(email);
  if (!user) {
    console.log('Creating default user...');
    const result = await authService.register({ email, password });
    console.log('User created with id:', result.user.id);
  } else {
    console.log('Default user already exists with id:', (user as any)._id?.toString());
  }

  // Seed a few movies (with posterPath) if none exist,
  // and update existing ones that lack a posterPath.
  const existing = await moviesService.findAll(1, 100);
  if (existing.total === 0) {
    console.log('Seeding movies with posters...');
    await moviesService.create({
      title: 'Inception',
      publishingYear: 2010,
      posterPath:
        'https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg',
    });
    await moviesService.create({
      title: 'Interstellar',
      publishingYear: 2014,
      posterPath:
        'https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
    });
    await moviesService.create({
      title: 'The Dark Knight',
      publishingYear: 2008,
      posterPath:
        'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    });
    console.log('Movies seeded');
  } else {
    console.log('Movies already present, ensuring posters are set...');
    const updates = existing.data.map(async (movie: any, index) => {
      if (!movie.posterPath) {
        const posters = [
          'https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg',
          'https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
          'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        ];
        const posterPath = posters[index % posters.length];
        await moviesService.update(movie._id.toString(), { posterPath });
        console.log('Updated movie poster for', movie.title);
      }
    });
    await Promise.all(updates);
  }

  await app.close();
}

bootstrap()
  .then(() => {
    console.log('Seeding complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed', err);
    process.exit(1);
  });
