import HomeLoadingAnimation from "./components/layout/loading-animations/HomeLoadingAnimation.svelte";
import Albums from "./routes/albums/Albums.svelte";
import AlbumsByArtist from "./routes/albums/AlbumsByArtist.svelte";
import AblumDetails from "./routes/albums/Details.svelte";
import AlbumEditor from "./routes/albums/Edit.svelte";
import Artists from "./routes/artists/Artists.svelte";
import ArtistDetails from "./routes/artists/Details.svelte";
import SimilarArtists from "./routes/artists/SimilarArtists.svelte";
import GenreDetails from "./routes/genres/Details.svelte";
import Genres from "./routes/genres/Genres.svelte";
import History from "./routes/home/History.svelte";
import Home from "./routes/home/Home.svelte";
import MostPlayed from "./routes/home/MostPlayed.svelte";
import RecentlyAdded from "./routes/home/RecentlyAdded.svelte";
import TopAlbums from "./routes/home/TopAlbums.svelte";
import TopArtists from "./routes/home/TopArtists.svelte";
import PlaylistDetails from "./routes/playlists/Details.svelte";
import PlaylistEditor from "./routes/playlists/Edit.svelte";
import Playlists from "./routes/playlists/Playlists.svelte";
import Search from "./routes/Search.svelte";
import AboutSettings from "./routes/settings/About.svelte";
import AppearanceSettings from "./routes/settings/Appearance.svelte";
import AudioSettings from "./routes/settings/Audio.svelte";
import BackupSettings from "./routes/settings/Backup.svelte";
import NowPlayingSettings from "./routes/settings/NowPlaying.svelte";
import OtherSettings from "./routes/settings/Other.svelte";
import PersonalizeSettings from "./routes/settings/Personalize.svelte";
import Settings from "./routes/settings/Settings.svelte";
import SongDetails from "./routes/songs/Details.svelte";
import SongEditor from "./routes/songs/Edit.svelte";
import Songs from "./routes/songs/Songs.svelte";

/**
 * A LUT for mapping Views to their routes.
 */
export const viewRoutesLUT = {
  0: "/playlists",
  1: "/albums",
  2: "/songs",
  3: "/artists",
  4: "/genres",
  5: "/settings",
  6: "/home",
  7: "/search"
}

/**
 * The app's routes.
 */
export const routes = {
  "/": HomeLoadingAnimation,

  "/playlists": Playlists,
  "/playlists/:id": PlaylistDetails,
  "/playlists/:id/edit": PlaylistEditor,

  "/albums": Albums,
  "/albums/:key": AblumDetails,
  "/albums/:key/alt": AblumDetails,
  "/albums/:key/edit": AlbumEditor,
  "/albums/:key/albums-by-artist": AlbumsByArtist,

  "/songs": Songs,
  "/songs/:id": SongDetails,
  "/songs/:id/edit": SongEditor,

  "/artists": Artists,
  "/artists/:key": ArtistDetails,
  "/artists/:key/alt": ArtistDetails,
  "/artists/:key/similar": SimilarArtists,

  "/genres": Genres,
  "/genres/:key": GenreDetails,

  "/search": Search,

  "/settings": Settings,
  "/settings/appearance": AppearanceSettings,
  "/settings/now-playing": NowPlayingSettings,
  "/settings/audio": AudioSettings,
  "/settings/personalize": PersonalizeSettings,
  "/settings/other": OtherSettings,
  "/settings/backup": BackupSettings,
  "/settings/about": AboutSettings,

  "/home": Home,
  "/home/history": History,
  "/home/most-played": MostPlayed,
  "/home/recently-added": RecentlyAdded,
  "/home/top-artists": TopArtists,
  "/home/top-albums": TopAlbums,
}