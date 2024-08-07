import { Album, Song } from "@models";
import { desktopSidePanel, sidePanelProps, SidePanels } from "@stores/Layout";
import { t as translate } from "@stores/Locale";
import { albums, history, nowPlayingList, playingSongId, playlists, queue, showErrorSnackbar, showInfoSnackbar, songs, songsMap } from "@stores/State";
import { get } from "svelte/store";
import { bulkEditSongIds } from "../../stores/Select";
import { backFromSidePanel } from "../utils";
import { AppController } from "./AppController";
import { QueueController } from "./QueueController";
import { DialogController } from "./utils/DialogController";
import { LogController } from "./utils/LogController";
import { RustInterop } from "./utils/RustInterop";

/**
 * The controller for editing music, albums and artists.
 */
export class EditController {
  /**
   * Updates the provided song based on the edited fields.
   * @param original The original song.
   * @param editFields The edited fields.
   */
  private static editSongFields(original: Song, editFields: SongEditFields): void {
    for (const key of Object.keys(editFields)) {
      const songKey = key as keyof Song;
      let newValue = editFields[key as keyof SongEditFields];
      
      if (key === "releaseYear" && !newValue) newValue = -1;
      if (key === "title" && !newValue) newValue = original.fileName;

      // @ts-expect-error TS is warning about potentially assigning functions to editField's values, but because its hardcoded, we know that can't happen.
      original[songKey] = newValue;
    }
  }

  /**
   * Updates the provided album based on the edited fields.
   * @param original The original album.
   * @param editFields The edited fields.
   */
  private static editAlbumFields(original: Album, editFields: AlbumEditFields): void {
    for (const key of Object.keys(editFields)) {
      const albumKey = key as keyof Album;

      // @ts-expect-error TS is warning about potentially assigning functions to editField's values, but because its hardcoded, we know that can't happen.
      original[albumKey] = editFields[key as keyof AlbumEditFields];
    }
  }

  /**
   * Applies the changes made to a song, and updates the artist/album (or creates/deletes them) as needed.
   * @param original The original song.
   * @param editedFields The edited fields.
   */
  static async editSong(original: Song, editedFields: SongEditFields) {
    const t = get(translate);
    const changes: Record<string, SongEditFields> = {};
    changes[original.filePath] = editedFields;
    const success = await RustInterop.writeMusicFiles(changes);
    
    if (success) {
      this.editSongFields(original, editedFields);
      
      const songsList = get(songs);
      songs.set(songsList);
      
      AppController.loadAlbumsFromSongs(songsList);
      AppController.loadArtistsFromSongs(songsList);
      AppController.loadGenresFromSongs(songsList);

      get(showInfoSnackbar)({ message: t("FINISHED_WRITING_CHANGES_MESSAGE") });
      LogController.log(`Finished writing edits to ${original.id}`);
    } else {
      get(showErrorSnackbar)({ message: t("FAILED_WRITING_CHANGES_MESSAGE") });
    }
  }

  /**
   * Applies the changes made to a list of songs, and updates the artist/album (or creates/deletes them) as needed.
   * @param songPaths A dictionary mapping filePath -> songId.
   * @param changes A dictionary mapping filePath -> edited fields.
   */
  static async bulkEditSongs(songPaths: Record<string, string>, changes: Record<string, SongEditFields>) {
    const t = get(translate);
    const songIds = Object.keys(songPaths);

    const songMap = get(songsMap);
    const success = await RustInterop.writeMusicFiles(changes);

    if (success) {
      for (const id of songIds) {
        const song = songMap[id];
        const change = changes[song.filePath];

        this.editSongFields(song, change);
      }

      const songsList = get(songs);
      songs.set(songsList);
      
      AppController.loadAlbumsFromSongs(songsList);
      AppController.loadArtistsFromSongs(songsList);
      AppController.loadGenresFromSongs(songsList);

      get(showInfoSnackbar)({ message: t("FINISHED_WRITING_CHANGES_MESSAGE") });
      LogController.log(`Finished writing edits to ${songIds.length} songs`);
    } else {
      get(showErrorSnackbar)({ message: t("FAILED_WRITING_CHANGES_MESSAGE") });
    }
  }

  /**
   * Applies the changes made to an album, and updates the songs/artists (or creates/deletes them) as needed.
   * @param original The original album.
   * @param changedAlbumFields The edited album fields.
   */
  static async editAlbum(original: Album, changedAlbumFields: AlbumEditFields) {
    const t = get(translate);
    return new Promise<void>(async (resolve, reject) => {
      let isRenamedToAnother = false;

      let albumToEdit = original;
      const albumsList = get(albums);

      if (changedAlbumFields.artPath) {
        const copiedPath = await this.copyAlbumImage(changedAlbumFields.artPath, original.name);
        changedAlbumFields.artPath = copiedPath;
      }

      const songMap = get(songsMap);
      const changes: Record<string, SongEditFields> = {};

      const matchingAlbum = albumsList.find((album) => album.name === changedAlbumFields.name && album.name !== original.name);
      if (matchingAlbum) {
        albumToEdit = matchingAlbum;
        changedAlbumFields.albumArtist = albumToEdit.albumArtist;
        isRenamedToAnother = true;
      }

      for (const id of original.songIds) {
        const song = songMap[id];
        changes[song.filePath] = {
          "artPath": changedAlbumFields.artPath,
          "title": song.title,
          "album": changedAlbumFields.name,
          "composer": song.composer,
          "albumArtist": changedAlbumFields.albumArtist,
          "artist": song.artist,
          "releaseYear": changedAlbumFields.releaseYear,
          "genre": changedAlbumFields.genre,
          "trackNumber": song.trackNumber
        };
      }
      
      const success = await RustInterop.writeMusicFiles(changes);
      if (success) {
        this.editAlbumFields(albumToEdit, changedAlbumFields);
        await albumToEdit.setBackgroundFromImage();

        for (const id of original.songIds) {
          const song = songMap[id];
          const change = changes[song.filePath];

          song.album = change.album;
          song.artPath = change.artPath;
          song.albumArtist = change.albumArtist;
          song.releaseYear = change.releaseYear ?? -1;
          song.genre = change.genre;
        }

        const songsList = get(songs);
        songs.set(songsList);

        if (isRenamedToAnother) {
          albumToEdit.songIds.push(...original.songIds);

          const originalIndex = albumsList.indexOf(original);
          albumsList.splice(originalIndex, 1);
        }
        
        albums.set(albumsList);

        AppController.loadArtistsFromSongs(songsList);
        AppController.loadGenresFromSongs(songsList);

        get(showInfoSnackbar)({ message: t("FINISHED_WRITING_CHANGES_MESSAGE") });
        LogController.log(`Finished writing edits to ${original.name}`);
        resolve();
      } else {
        get(showErrorSnackbar)({ message: t("FAILED_WRITING_CHANGES_MESSAGE") });
        reject();
      }
    });
  }

  /**
   * Deletes the provided songs from the device.
   * @param songIds The ids of the songs to delete.
   */
  static async deleteSongsFromDevice(songIds: string[]) {
    const t = get(translate);
    const numSongsMessage = `${songIds.length} ${songIds.length === 1 ? t("SONG_SINGULAR_VALUE") : t("SONG_PLURAL_VALUE")}`;

    DialogController.ask(t("CANT_BE_UNDONE_TITLE"), `${t("CONFIRM_DELETE_MESSAGE")} ${numSongsMessage}?`, t("YES_ACTION"), t("NO_ACTION")).then(async (shouldContinue) => {
      if (shouldContinue) {
        const panel = get(desktopSidePanel);
        const panelProps = get(sidePanelProps);
        const bulkSongIds = get(bulkEditSongIds);

        if (panel === SidePanels.SONG_DETAILS && songIds.includes(panelProps.id)) backFromSidePanel();
        if (panel === SidePanels.SONG_EDIT && songIds.includes(panelProps.id)) backFromSidePanel();
        if (panel === SidePanels.SONG_BULK_EDIT && bulkSongIds.some((id) => songIds.includes(id))) {
          backFromSidePanel();
          bulkEditSongIds.set([]);
        }

        const filePaths: string[] = [];
        const songList = get(songs);
        const playlistList = get(playlists);
        const songQueue = get(queue);
        const songHistory = get(history);
        const nowPlayingSongId = get(playingSongId);

        for (const id of songIds) {
          const index = songList.findIndex((song) => song.id === id);
          const [song] = songList.splice(index, 1);

          const queueIndex = songQueue.indexOf(id);
          if (queueIndex !== -1) songQueue.splice(queueIndex, 1);

          const historyIndex = songHistory.indexOf(id);
          if (historyIndex !== -1) songHistory.splice(historyIndex, 1);
          
          if (id === nowPlayingSongId) QueueController.skip();

          filePaths.push(song.filePath);
        }

        for (const playlist of playlistList) {
          for (const id of songIds) {
            const index = playlist.songIds.indexOf(id);

            if (index > -1) playlist.songIds.splice(index, 1);
          }
        }

        songs.set(songList);
        queue.set(songQueue);
        history.set(songHistory);
        
        const successPromise = RustInterop.deleteSongs(filePaths);

        AppController.loadAlbumsFromSongs(songList);
        AppController.loadArtistsFromSongs(songList);
        AppController.loadGenresFromSongs(songList);
        
        const success = await successPromise;

        if (success) {
          get(showInfoSnackbar)({ message: numSongsMessage + " " + t("DELETED_VALUE") });
        } else {
          get(showErrorSnackbar)({ message: t("FAILED_DELETE_SELECTED_MESSAGE") + " " + t("SONG_PLURAL_VALUE") })
        }
      }
    });
  }

  /**
   * Deletes the provided albums from the device.
   * @param albumNames The names of the albums to delete.
   */
  static async deleteAlbumsFromDevice(albumNames: string[]) {
    const t = get(translate);
    const numSongsMessage = `${albumNames.length} ${albumNames.length === 1 ? t("ALBUM_SINGULAR_VALUE") : t("ALBUM_PLURAL_VALUE")}`;

    DialogController.ask(t("CANT_BE_UNDONE_TITLE"), `${t("CONFIRM_DELETE_MESSAGE")} ${numSongsMessage}?`, t("YES_ACTION"), t("NO_ACTION")).then(async (shouldContinue) => {
      if (shouldContinue) {
        if (get(desktopSidePanel) === SidePanels.ALBUM_EDIT && albumNames.includes(get(sidePanelProps).key)) backFromSidePanel();

        const filePaths: string[] = [];
        const albumList = get(albums);
        const songList = get(songs);
        const playlistList = get(playlists);
        const songQueue = get(queue);
        const songHistory = get(history);
        const nowPlayingName = get(nowPlayingList);
        const nowPlayingSongId = get(playingSongId);

        let deletedSongIds: string[] = [];

        for (const albumName of albumNames) {
          const albumIndex = albumList.findIndex((album) => album.name === albumName);
          const [album] = albumList.splice(albumIndex, 1);
          
          for (const id of album.songIds) {
            const songIndex = songList.findIndex((song) => song.id === id);
            const [song] = songList.splice(songIndex, 1);

            const queueIndex = songQueue.indexOf(id);
            if (queueIndex !== -1) songQueue.splice(queueIndex, 1);
  
            const historyIndex = songHistory.indexOf(id);
            if (historyIndex !== -1) songHistory.splice(historyIndex, 1);

            if (id === nowPlayingSongId) QueueController.skip();

            filePaths.push(song.filePath);
            deletedSongIds.push(id);
          }

          if (albumName === nowPlayingName) nowPlayingList.set("");
        }

        for (const playlist of playlistList) {
          for (const id of deletedSongIds) {
            const index = playlist.songIds.indexOf(id);

            if (index > -1) playlist.songIds.splice(index, 1);
          }
        }

        albums.set(albumList);
        songs.set(songList);
        queue.set(songQueue);
        history.set(songHistory);
        
        const successPromise = RustInterop.deleteSongs(filePaths);

        AppController.loadAlbumsFromSongs(songList);
        AppController.loadArtistsFromSongs(songList);
        AppController.loadGenresFromSongs(songList);
        
        const success = await successPromise;

        if (success) {
          get(showInfoSnackbar)({ message: numSongsMessage + " " + t("DELETED_VALUE") });
        } else {
          get(showErrorSnackbar)({ message: t("FAILED_DELETE_SELECTED_MESSAGE") + " " + t("ALBUM_PLURAL_VALUE") });
        }
      }
    });
  }

  /**
   * Deletes the provided playlists from the device.
   * @param playlistIds The ids of the playlists to delete.
   */
  static async deletePlaylistsFromDevice(playlistIds: string[]) {
    const t = get(translate);
    const numPlaylistMessage = `${playlistIds.length} ${playlistIds.length === 1 ? t("PLAYLIST_SINGULAR_VALUE") : t("PLAYLIST_PLURAL_VALUE")}`;

    DialogController.ask(t("CANT_BE_UNDONE_TITLE"), `${t("CONFIRM_DELETE_MESSAGE")} ${numPlaylistMessage}?`, t("YES_ACTION"), t("NO_ACTION")).then((shouldContinue) => {
      if (shouldContinue) {
        if (get(desktopSidePanel) === SidePanels.PLAYLIST_EDIT && playlistIds.includes(get(sidePanelProps).id)) backFromSidePanel();

        const playlistList = get(playlists);
        const nowPlayingName = get(nowPlayingList);
        
        for (const id of playlistIds) {
          const index = playlistList.findIndex((playlist) => playlist.id === id);
          playlistList.splice(index, 1);

          if (id === nowPlayingName) {
            nowPlayingList.set("");
          }
        }

        playlists.set(playlistList);

        LogController.log(`Deleted ${numPlaylistMessage}.`);
        get(showInfoSnackbar)({ message: numPlaylistMessage + " " + t("DELETED_VALUE") });
      }
    });
  }

  /**
   * Copies the provided image to the "albums" directory.
   * @param imagePath The image path to copy.
   * @param albumName The name of the album.
   * @returns The image path, or undefined if it was undefined.
   */
  static async copyAlbumImage(imagePath: string | undefined, albumName: string): Promise<string | undefined> {
    const t = get(translate);
    if (!imagePath) return undefined;
    
    const result = await RustInterop.copyAlbumsImage(imagePath, albumName);
    if (result === "") {
      get(showErrorSnackbar)({ message: t("INVALID_IMAGE_MESSAGE"), faster: true })
      return undefined;
    }

    return result;
  }

  /**
   * Copies the provided image to the "artists" directory.
   * @param imagePath The image path to copy.
   * @returns The image path, or undefined if it was undefined.
   */
  static async copyArtistImage(imagePath: string | undefined): Promise<string | undefined> {
    const t = get(translate);
    if (!imagePath) return undefined;

    const result = await RustInterop.copyArtistImage(imagePath);
    if (result === "") {
      get(showErrorSnackbar)({ message: t("INVALID_IMAGE_MESSAGE"), faster: true })
      return undefined;
    }

    return result;
  }

  /**
   * Copies the provided image to the "Playlists" directory.
   * @param imagePath The image path to copy.
   * @returns The image path, or undefined if it was undefined.
   */
  static async copyPlaylistImage(imagePath: string | undefined): Promise<string | undefined> {
    const t = get(translate);
    if (!imagePath) return undefined;

    const result = await RustInterop.copyPlaylistImage(imagePath);
    if (result === "") {
      get(showErrorSnackbar)({ message: t("INVALID_IMAGE_MESSAGE"), faster: true })
      return undefined;
    }

    return result;
  }
}