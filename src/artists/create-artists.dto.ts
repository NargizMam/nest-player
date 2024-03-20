export class CreateArtistsDto {
  title: string;
  image: string | null;
  description?: string;
  isPublished?: boolean;
  user: string;
}
