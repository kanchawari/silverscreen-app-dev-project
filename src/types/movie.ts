export const TMDB_API_KEY = '6dfcadad631d6942cd4db94965b58ad0';

export type Movie = {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  genre_ids: number[];
  overview: string;
};

export type Genre = {
  id: number;
  name: string;
}; 