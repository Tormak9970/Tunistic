import { writable, type Writable } from "svelte/store";

export const showEditMusicFolders = writable(false);
export const showNowPlaying = writable(true); // ! will be false after tested.

export const showSongDetails = writable(true); // ! will be false after tested.
export const isEditingSong = writable(false); // ! will be false after tested.

export const showAddToPlaylist = writable(true); // ! will be false after tested.
export const songToAdd: Writable<string | null> = writable(null);
export const albumToAdd: Writable<string | null> = writable(null);
export const artistToAdd: Writable<string | null> = writable(null);

export const playlistViewing: Writable<string | null> = writable(null);
export const songViewing: Writable<string | null> = writable(null);
export const albumViewing: Writable<string | null> = writable(null);
export const artistViewing: Writable<string | null> = writable(null);
export const genreViewing: Writable<string | null> = writable(null);