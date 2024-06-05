import { get } from "svelte/store";
import { isPaused, nowPlayingList, playingSongId, playlists, queue, shuffle, songProgress } from "../../stores/State";
import type { Album } from "../models/Album";
import type { Artist } from "../models/Artist";
import type { Playlist } from "../models/Playlist";
import type { Song } from "../models/Song";
import { SettingsController } from "./SettingsController";
import type { Genre } from "../models/Genre";
import { shuffleSongs } from "../utils/Shuffle";

// ! Add logging to this file

/**
 * Controller that handles playback.
 */
export class PlaybackController {
  /**
   * Plays the provided playlist.
   * @param playlist The playlist to play.
   */
  static playPlaylist(playlist: Playlist) {
    if (playlist.songIds.length) {
      const shouldShuffle = get(shuffle);

      songProgress.set(0);
      nowPlayingList.set(playlist.id);

      playlist.numTimesPlayed++;
      playlist.setLastPlayed();
      playlists.set([ ...get(playlists) ]);

      const cloned = structuredClone(playlist.songIds);
      const newQueue: string[] = shouldShuffle ? shuffleSongs(cloned) : cloned;
      const firstSongId = newQueue.shift()!;

      playingSongId.set(firstSongId);

      queue.set(newQueue);

      this.resume();
    }
  }

  /**
   * Plays the provided song.
   * @param song The song to play.
   */
  static playSong(song: Song) {
    songProgress.set(0);
    nowPlayingList.set("");

    song.numTimesPlayed++;
    song.setLastPlayed();
    SettingsController.updateSongMetadata(song);

    playingSongId.set(song.id);

    this.resume();
  }
  
  /**
   * Plays the provided album.
   * @param album The album to play.
   */
  static playAlbum(album: Album) {
    const shouldShuffle = get(shuffle);

    songProgress.set(0);
    nowPlayingList.set(album.name);

    album.numTimesPlayed++;
    album.setLastPlayed();
    SettingsController.updateAlbumsMetadata([album]);
    
    const cloned = structuredClone(album.songIds);
    const newQueue: string[] = shouldShuffle ? shuffleSongs(cloned) : cloned;
    const firstSongId = newQueue.shift()!;

    playingSongId.set(firstSongId);

    queue.set(newQueue);

    this.resume();
  }
  
  /**
   * Plays the provided artist.
   * @param artist The artist to play.
   */
  static playArtist(artist: Artist) {
    const shouldShuffle = get(shuffle);

    songProgress.set(0);
    nowPlayingList.set(artist.name);
    
    const cloned = structuredClone(artist.songIds);
    const newQueue: string[] = shouldShuffle ? shuffleSongs(cloned) : cloned;
    const firstSongId = newQueue.shift()!;

    playingSongId.set(firstSongId);

    queue.set(newQueue);
    
    this.resume();
  }
  
  /**
   * Plays the provided genre.
   * @param genre The genre to play.
   */
  static playGenre(genre: Genre) {
    const shouldShuffle = get(shuffle);

    songProgress.set(0);
    nowPlayingList.set(genre.name);
    
    const cloned = structuredClone(genre.songIds);
    const newQueue: string[] = shouldShuffle ? shuffleSongs(cloned) : cloned;
    const firstSongId = newQueue.shift()!;

    playingSongId.set(firstSongId);

    queue.set(newQueue);

    this.resume();
  }

  private static stopPlayback() {

  }

  /**
   * Pauses the playback.
   */
  static pause() {
    isPaused.set(true);

    // TODO: pause audio playback
  }
  
  private static startPlayback() {

  }

  /**
   * Resumes the playback.
   */
  static resume() {
    isPaused.set(false);
    
    // TODO: start audio playback
  }
}