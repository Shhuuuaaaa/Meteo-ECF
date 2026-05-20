import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoriteCity {
  name: string
  country: string
}

interface FavoritesStore {
  favorites: FavoriteCity[]
  addFavorite: (city: FavoriteCity) => void
  removeFavorite: (name: string) => void
  isFavorite: (name: string) => boolean
}

// `persist` serialises the store to localStorage under the key 'meteo-favorites'
// and rehydrates automatically on the next page load.
//
// Components that read this store must use a `useMounted` guard before rendering
// favorite-dependent UI: Next.js SSRs client components with the initial state
// (favorites = []), then hydrates with the real localStorage values. Without the
// guard, the star icon flickers from "unfavorited" to "favorited" on first paint.
export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      // Deduplication is enforced in the store rather than in each call site
      // so callers never have to think about it.
      addFavorite: (city) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.name === city.name)
            ? state.favorites
            : [...state.favorites, city],
        })),
      removeFavorite: (name) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.name !== name),
        })),
      isFavorite: (name) => get().favorites.some((f) => f.name === name),
    }),
    { name: 'meteo-favorites' }
  )
)
