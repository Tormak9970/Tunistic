/**
 * Copyright (C) 2023 Travis Lane (Tormak)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>
 */
import { fs, path } from "@tauri-apps/api";
import { type AlbumMetadata, type ArtistMetadata, type NowPlayingType, type Palette, type Settings, type SongMetadata, AppLanguage, DEFAULT_SETTINGS, GridSize, GridStyle, NowPlayingTheme } from "../../types/Settings";
import { LogController } from "./utils/LogController";
import { albumGridSize, albums, albumSortOrder, artistGridSize, artistGridStyle, artistSortOrder, autoPlayOnBluetooth, autoPlayOnConnect, circularPlayButton, dismissMiniPlayerWithSwipe, fadeAudioOnPause, palette, blacklistedFolders, musicDirectories, nowPlayingTheme, nowPlayingListName, nowPlayingMiniUseAlbumColors, nowPlayingType, nowPlayingUseAlbumColors, playlistGridSize, playlists, playlistSortOrder, queue, selectedView, showExtraControls, showExtraSongInfo, showVolumeControls, songGridSize, songName, songProgress, songs, songSortOrder, themePrimaryColor, useAlbumColors, useOledPalette, viewsToRender, pauseOnVolumeZero, filterSongDuration, selectedLanguage, useArtistColors, artists, shuffle, isPaused, showInfoSnackbar, showErrorSnackbar } from "../../stores/State";
import { View } from "../../types/View";
import { Playlist } from "../models/Playlist";
import { Song } from "../models/Song";
import type { Album } from "../models/Album";
import { get, type Unsubscriber } from "svelte/store";
import { debounce } from "../utils/Utils";
import type { Artist } from "../models/Artist";

/**
 * Sets settings to defaults if they do not exist.
 * @param object The settings object.
 * @param defaults The corresponding default values.
 * @returns The updated settings.
 */
function setIfNotExist(object: any, defaults: any): any {
  if (object?.length || object?.length === 0) return object;

  const currentKeys = Object.keys(object);
  const defaultEntries = Object.entries(defaults);
  const defaultKeys = Object.keys(object);

  for (const key in object) {
    if (!defaultKeys.includes(key)) {
      // @ts-ignore
      delete object[key];
    }
  }

  for (const [ key, val ] of defaultEntries) {
    if (!currentKeys.includes(key)) {
      // @ts-ignore
      object[key] = val;
    }

    if (typeof defaults[key] === "object") {
      object[key] = setIfNotExist(object[key], defaults[key])
    }
  }

  return object;
}

/**
 * The controller for settings.
 */
export class SettingsController {
  static settingsHaveChanged = false;
  private static settingsPath = "";
  private static settings: Settings;

  private static paletteUnsub: Unsubscriber;
  private static useOledPaletteUnsub: Unsubscriber;
  private static themePrimaryColorUnsub: Unsubscriber;

  private static musicDirectoriesUnsub: Unsubscriber;
  private static selectedViewUnsub: Unsubscriber;

  private static showExtraSongInfoUnsub: Unsubscriber;
  private static circularPlayButtonUnsub: Unsubscriber;
  private static nowPlayingThemeUnsub: Unsubscriber;
  private static nowPlayingUseAlbumColorsUnsub: Unsubscriber;
  private static nowPlayingMiniUseAlbumColorsUnsub: Unsubscriber;

  private static viewsToRenderUnsub: Unsubscriber;

  private static dismissMiniPlayerWithSwipeUnsub: Unsubscriber;
  private static showExtraControlsUnsub: Unsubscriber;
  private static showVolumeControlsUnsub: Unsubscriber;

  private static fadeAudioOnPauseUnsub: Unsubscriber;
  private static autoPlayOnConnectUnsub: Unsubscriber;
  private static autoPlayOnBluetoothUnsub: Unsubscriber;

  private static playlistsUnsub: Unsubscriber;

  private static queueUnsub: Unsubscriber;

  private static blacklistedFoldersUnsub: Unsubscriber;
  private static pauseOnVolumeZeroUnsub: Unsubscriber;
  private static filterSongDurationUnsub: Unsubscriber;
  private static selectedLanguageUnsub: Unsubscriber;

  private static albumsUnsub: Unsubscriber;
  private static songsUnsub: Unsubscriber;
  private static artistsUnsub: Unsubscriber;
  private static songProgressUnsub: Unsubscriber;
  private static songNameUnsub: Unsubscriber;
  private static shuffleUnsub: Unsubscriber;
  private static isPausedUnsub: Unsubscriber;
  private static nowPlayingListNameUnsub: Unsubscriber;
  private static nowPlayingTypeUnsub: Unsubscriber;

  private static playlistGridSizeUnsub: Unsubscriber;
  private static playlistSortOrderUnsub: Unsubscriber;

  private static albumGridSizeUnsub: Unsubscriber;
  private static albumSortOrderUnsub: Unsubscriber;
  private static useAlbumColorsUnsub: Unsubscriber;

  private static songGridSizeUnsub: Unsubscriber;
  private static songSortOrderUnsub: Unsubscriber;

  private static artistGridSizeUnsub: Unsubscriber;
  private static artistGridStyleUnsub: Unsubscriber;
  private static artistSortOrderUnsub: Unsubscriber;
  private static useArtistColorsUnsub: Unsubscriber;

  /**
   * Initializes the SettingsController.
   */
  static async init() {
    const appDir = await path.appConfigDir();
    if (!(await fs.exists(appDir))) await fs.createDir(appDir);

    const setsPath = await path.join(appDir, "settings.json");
    if (!(await fs.exists(setsPath))) {
      await fs.writeTextFile(setsPath, JSON.stringify(DEFAULT_SETTINGS, null, "\t"));
    }

    this.settingsPath = setsPath;
    
    this.settings = await this.loadSettingsFromDevice();
    this.setStores();
    this.registerSubs();

    LogController.log("Initialized Settings.");
  }

  /**
   * Migrate the settings structure to account for changes in the structure.
   */
  private static migrateSettingsStructure(oldSettings: Settings): Settings {
    // ? Handle any changes to settings from version to version here. Ex:
    // if (oldSettings?.filters) {
    //   oldSettings.windowSettings.main.filters = oldSettings.filters ?? DEFAULT_SETTINGS.windowSettings.main.filters;
    //   delete oldSettings.filters;
    // }

    return oldSettings;
  }

  /**
   * Gets the given settings field.
   * @param field The settings property to get.
   * @returns The given setting, or its default value if it does not exist.
   */
  static getSetting<T>(field: string): T {
    const settings: any = structuredClone(this.settings);
    const fieldPath = field.split(".");
    let parentObject = settings;

    for (let i = 0; i < fieldPath. length - 1; i++) {
      const key = fieldPath[i];
      
      parentObject = parentObject[key];
    }

    const finalKey = fieldPath[fieldPath.length - 1];
    return parentObject[finalKey];
  }

  /**
   * Updates the given settings field with the provided data.
   * @param field The setting to update.
   * @param val The new value.
   */
  private static updateSetting<T>(field: string, val: T): void {
    const settings = structuredClone(this.settings);
    const fieldPath = field.split(".");
    let parentObject = settings;

    for (let i = 0; i < fieldPath. length - 1; i++) {
      // @ts-ignore
      parentObject = parentObject[fieldPath[i]];
    }

    // @ts-ignore
    parentObject[fieldPath[fieldPath.length - 1]] = val;

    this.settings = settings;
    this.save()

    const stringified = JSON.stringify(val);
    LogController.log(stringified.length < 200 ? `Updated setting ${field} to ${stringified}.` : `Updated setting ${field}.`);
  }

  /**
   * Returns a function that updates the given setting if the value has changed.
   * @param field The setting to update.
   * @returns A function that updates the given setting if the value has changed.
   */
  private static updateStoreIfChanged<T>(field: string): (val: T) => void {
    return (val: T) => {
      const original = this.getSetting<T>(field);

      if (original !== val) {
        this.updateSetting(field, val);
      }
    }
  }

  /**
   * Loads the settings from the device.
   */
  private static async loadSettingsFromDevice(): Promise<Settings> {
    const contents = await fs.readTextFile(this.settingsPath);
    let currentSettings: any;

    try {
      currentSettings = contents !== "" ? JSON.parse(contents) : structuredClone(DEFAULT_SETTINGS);
    } catch(e) {
      currentSettings = structuredClone(DEFAULT_SETTINGS);
      LogController.error("Settings were corrupted.");
    }

    let settings: Settings = structuredClone(currentSettings);
    
    const defaultSettings = structuredClone(DEFAULT_SETTINGS);

    settings = setIfNotExist(settings, defaultSettings);
    settings = this.migrateSettingsStructure(settings);

    settings.version = APP_VERSION;

    await this.save();

    LogController.log("Finished checking settings for new app version and/or migration.");

    return settings;
  }

  /**
   * Applies the settings from a backup file.
   * @param filePath The filepath of the backup.
   */
  static async applyBackup(filePath: string) {
    const contents = await fs.readTextFile(filePath);

    if (contents !== "") {
      let currentContents: any = JSON.parse(contents);

      if (currentContents.FILE_SIG_DO_NOT_EDIT === "dev.travislane.tunistic") {
        let settings: Settings = currentContents;
    
        const defaultSettings = structuredClone(DEFAULT_SETTINGS);

        settings = setIfNotExist(settings, defaultSettings);
        settings = this.migrateSettingsStructure(settings);

        settings.version = APP_VERSION;
        this.settings = settings;

        await this.save();

        get(showInfoSnackbar)({ message: "Success!", timeout: 1000 });
        LogController.log("Successfully restored backup.");
      } else {
        get(showErrorSnackbar)({ message: "Invalid backup file", timeout: 2000 });
        LogController.error("Backup did not contain the FILE_SIG.");
      }
    } else {
      LogController.error("Backup was empty.");
    }
  }

  /**
   * Resets the app's settings.
   */
  static async resetSettings() {
    this.settings = structuredClone(DEFAULT_SETTINGS);
    await this.save();

    get(showInfoSnackbar)({ message: "Success!", timeout: 1000 });
    LogController.log("Successfully reset settings.");
  }

  /**
   * Sets the Svelte stores associated with the settings.
   */
  private static setStores(): void {
    palette.set(this.settings.palette);
    useOledPalette.set(this.settings.useOledPalette);
    themePrimaryColor.set(this.settings.themePrimaryColor);

    musicDirectories.set(this.settings.musicDirectories);
    selectedView.set(this.settings.selectedView);


    const nowPlaying = this.settings.nowPlaying;
    showExtraSongInfo.set(nowPlaying.songInfo);
    circularPlayButton.set(nowPlaying.circularPlayButton);
    nowPlayingTheme.set(nowPlaying.layout);
    nowPlayingUseAlbumColors.set(nowPlaying.useAlbumColors);
    nowPlayingMiniUseAlbumColors.set(nowPlaying.useAlbumColorsForMini);

    const controls = nowPlaying.controls;
    dismissMiniPlayerWithSwipe.set(controls.dismissMiniWithSwipe);
    showExtraControls.set(controls.extraControls);
    showVolumeControls.set(controls.volumeControls);


    const personalization = this.settings.personalization;
    viewsToRender.set(personalization.viewsToRender);

    const playlistList = this.settings.playlists.map((playlist) => Playlist.fromJSON(playlist));
    const songMetadata: Record<string, SongMetadata> = this.settings.cache.songsMetadata;

    for (const playlist of playlistList) {
      for (const key of playlist.songKeys) {
        if (!songMetadata[key]) {
          const index = playlist.songKeys.indexOf(key);
          playlist.songKeys.splice(index, 1);
        }
      }

    }

    playlists.set(playlistList);
    queue.set(this.settings.queue.map((song) => Song.fromJSON(song)).filter((song) => !!this.settings.cache.songsMetadata[song.key]));


    const audio = this.settings.audio;
    fadeAudioOnPause.set(audio.fade);
    autoPlayOnConnect.set(audio.autoPlay);
    autoPlayOnBluetooth.set(audio.autoPlayBluetooth);

    blacklistedFolders.set(this.settings.blacklistedFolders);
    pauseOnVolumeZero.set(this.settings.pauseOnVolumeZero);
    filterSongDuration.set(this.settings.filterSongDuration);
    selectedLanguage.set(this.settings.selectedLanguage);


    const cache = this.settings.cache;
    songProgress.set(cache.songProgress);
    songName.set(cache.songName);
    shuffle.set(cache.shuffle);
    isPaused.set(cache.isPaused);
    nowPlayingListName.set(cache.nowPlayingListName);
    nowPlayingType.set(cache.nowPlayingType);


    const playlistsView = this.settings.playlistsView;
    playlistGridSize.set(playlistsView.gridSize);
    playlistSortOrder.set(playlistsView.sortOrder);


    const albumsView = this.settings.albumsView;
    albumGridSize.set(albumsView.gridSize);
    albumSortOrder.set(albumsView.sortOrder);
    useAlbumColors.set(albumsView.useAlbumColors);


    const songsView = this.settings.songsView;
    songGridSize.set(songsView.gridSize);
    songSortOrder.set(songsView.sortOrder);


    const artistsView = this.settings.artistsView;
    artistGridSize.set(artistsView.gridSize);
    artistGridStyle.set(artistsView.gridStyle);
    artistSortOrder.set(artistsView.sortOrder);
    useArtistColors.set(artistsView.useArtistColors);
  }

  /**
   * Registers the subscriptions to stores.
   */
  private static registerSubs() {
    this.paletteUnsub = palette.subscribe(this.updateStoreIfChanged<Palette>("palette"));
    this.useOledPaletteUnsub = useOledPalette.subscribe(this.updateStoreIfChanged<boolean>("useOledPalette"));
    this.themePrimaryColorUnsub = themePrimaryColor.subscribe(this.updateStoreIfChanged<string>("themePrimaryColor"));

    this.musicDirectoriesUnsub = musicDirectories.subscribe(this.updateStoreIfChanged<string[]>("musicDirectories"));
    this.selectedViewUnsub = selectedView.subscribe((view: View) => {
      if (this.settings.personalization.viewsToRender.includes(view) && view !== View.SETTINGS && view !== View.SEARCH) {
        this.updateSetting<View>("selectedView", view);
      }
    });


    this.showExtraSongInfoUnsub = showExtraSongInfo.subscribe(this.updateStoreIfChanged<boolean>("nowPlaying.songInfo"));
    this.circularPlayButtonUnsub = circularPlayButton.subscribe(this.updateStoreIfChanged<boolean>("nowPlaying.circularPlayButton"));
    this.nowPlayingThemeUnsub = nowPlayingTheme.subscribe(this.updateStoreIfChanged<NowPlayingTheme>("nowPlaying.layout"));
    this.nowPlayingUseAlbumColorsUnsub = nowPlayingUseAlbumColors.subscribe(this.updateStoreIfChanged<boolean>("nowPlaying.useAlbumColors"));
    this.nowPlayingMiniUseAlbumColorsUnsub = nowPlayingMiniUseAlbumColors.subscribe(this.updateStoreIfChanged<boolean>("nowPlaying.useAlbumColorsForMini"));

    this.dismissMiniPlayerWithSwipeUnsub = dismissMiniPlayerWithSwipe.subscribe(this.updateStoreIfChanged<boolean>("nowPlaying.controls.dismissMiniWithSwipe"));
    this.showExtraControlsUnsub = showExtraControls.subscribe(this.updateStoreIfChanged<boolean>("nowPlaying.controls.extraControls"));
    this.showVolumeControlsUnsub = showVolumeControls.subscribe(this.updateStoreIfChanged<boolean>("nowPlaying.controls.volumeControls"));

    this.viewsToRenderUnsub = viewsToRender.subscribe(this.updateStoreIfChanged<View[]>("personalization.viewsToRender"));

    this.fadeAudioOnPauseUnsub = fadeAudioOnPause.subscribe(this.updateStoreIfChanged<boolean>("audio.fade"));
    this.autoPlayOnConnectUnsub = autoPlayOnConnect.subscribe(this.updateStoreIfChanged<boolean>("audio.autoPlay"));
    this.autoPlayOnBluetoothUnsub = autoPlayOnBluetooth.subscribe(this.updateStoreIfChanged<boolean>("audio.autoPlayBluetooth"));


    this.playlistsUnsub = playlists.subscribe(this.updateStoreIfChanged<Playlist[]>("playlists"));

    this.queueUnsub = queue.subscribe(this.updateStoreIfChanged<Song[]>("queue"));
    
    this.blacklistedFoldersUnsub = blacklistedFolders.subscribe(this.updateStoreIfChanged<string[]>("blacklistedFolders"));
    this.pauseOnVolumeZeroUnsub = pauseOnVolumeZero.subscribe(this.updateStoreIfChanged<boolean>("pauseOnVolumeZero"));
    this.filterSongDurationUnsub = filterSongDuration.subscribe(this.updateStoreIfChanged<number>("filterSongDuration"));
    this.selectedLanguageUnsub = selectedLanguage.subscribe(this.updateStoreIfChanged<AppLanguage>("selectedLanguage"));

    this.albumsUnsub = albums.subscribe((newAlbums) => {
      this.updateSetting<Record<string, AlbumMetadata>>("cache.albumsMetadata", Object.fromEntries(newAlbums.map((album) => {
        return [
          album.name,
          {
            "lastPlayedOn": album.lastPlayedOn,
            "numTimesPlayed": album.numTimesPlayed
          }
        ]
      })));
    });
    this.songsUnsub = songs.subscribe((newSongs) => {
      this.updateSetting<number>("cache.numSongs", newSongs.length);
      this.updateSetting<Record<string, SongMetadata>>("cache.songsMetadata", Object.fromEntries(newSongs.map((song) => {
        return [
          song.key,
          {
            "lastPlayedOn": song.lastPlayedOn,
            "numTimesPlayed": song.numTimesPlayed
          }
        ]
      })));
    });
    this.artistsUnsub = artists.subscribe((newArtists) => {
      this.updateSetting<Record<string, ArtistMetadata>>("cache.artistsMetadata", Object.fromEntries(newArtists.map((artist) => {
        return [
          artist.name,
          {
            "imagePath": artist.imagePath
          }
        ]
      })));
    });

    this.songProgressUnsub = songProgress.subscribe(this.updateStoreIfChanged<number>("cache.songProgress"));
    this.songNameUnsub = songName.subscribe(this.updateStoreIfChanged<string>("cache.songName"));
    this.shuffleUnsub = shuffle.subscribe(this.updateStoreIfChanged<boolean>("cache.shuffle"));
    this.isPausedUnsub = isPaused.subscribe(this.updateStoreIfChanged<boolean>("cache.isPaused"));
    this.nowPlayingListNameUnsub = nowPlayingListName.subscribe(this.updateStoreIfChanged<string>("cache.nowPlayingListName"));
    this.nowPlayingTypeUnsub = nowPlayingType.subscribe(this.updateStoreIfChanged<NowPlayingType>("cache.nowPlayingType"));


    this.playlistGridSizeUnsub = playlistGridSize.subscribe(this.updateStoreIfChanged<GridSize>("playlistsView.gridSize"));
    this.playlistSortOrderUnsub = playlistSortOrder.subscribe(this.updateStoreIfChanged<string>("playlistsView."));


    this.albumGridSizeUnsub = albumGridSize.subscribe(this.updateStoreIfChanged<GridSize>("albumsView.gridSize"));
    this.albumSortOrderUnsub = albumSortOrder.subscribe(this.updateStoreIfChanged<string>("albumsView.sortOrder"));
    this.useAlbumColorsUnsub = useAlbumColors.subscribe(this.updateStoreIfChanged<boolean>("albumsView.useAlbumColors"));


    this.songGridSizeUnsub = songGridSize.subscribe(this.updateStoreIfChanged<GridSize>("songsView.gridSize"));
    this.songSortOrderUnsub = songSortOrder.subscribe(this.updateStoreIfChanged<string>("songsView.sortOrder"));


    this.artistGridSizeUnsub = artistGridSize.subscribe(this.updateStoreIfChanged<GridSize>("artistsView.gridSize"));
    this.artistGridStyleUnsub = artistGridStyle.subscribe(this.updateStoreIfChanged<GridStyle>("artistsView.gridStyle"));
    this.artistSortOrderUnsub = artistSortOrder.subscribe(this.updateStoreIfChanged<string>("artistsView.sortOrder"));
    this.useArtistColorsUnsub = useArtistColors.subscribe(this.updateStoreIfChanged<boolean>("artistsView.useArtistColors"));
  }

  private static saveCallback = (value?: unknown) => {};
  private static async saveSettingsToDevice() {
    await fs.writeFile({
      path: this.settingsPath,
      contents: JSON.stringify(this.settings),
    }).then(SettingsController.saveCallback.bind(this));
  }
  private static debouncedSave = debounce(SettingsController.saveSettingsToDevice.bind(SettingsController), 500);

  /**
   * Saves the settings object.
   */
  static async save() {
    this.settingsHaveChanged = true;
    return new Promise<void>((resolve, reject) => {
      this.saveCallback = () => {
        this.settingsHaveChanged = false;
        resolve();
      };
      this.debouncedSave();
    })
  }

  /**
   * Writes the app's settings to a file.
   * @param filePath The path to save to.
   */
  static async saveSettingsToFile(filePath: string) {
    await fs.writeFile({
      path: filePath,
      contents: JSON.stringify(this.settings),
    });
  }

  /**
   * Updates the saved metadata for the provided artist.
   * @param artists The artists to update.
   */
  static updateArtistsMetadata(artists: Artist[]) {
    for (const artist of artists) {
      this.settings.cache.artistsMetadata[artist.name] = {
        "imagePath": artist.imagePath
      }
    }

    this.updateSetting<Record<string, ArtistMetadata>>("cache.artistsMetadata", this.settings.cache.artistsMetadata);
  }

  /**
   * Updates the saved metadata for the provided album.
   * @param albums The albums to update.
   */
  static updateAlbumsMetadata(albums: Album[]) {
    for (const album of albums) {
      this.settings.cache.albumsMetadata[album.name] = {
        "lastPlayedOn": album.lastPlayedOn,
        "numTimesPlayed": album.numTimesPlayed
      }
    }

    this.updateSetting<Record<string, AlbumMetadata>>("cache.albumsMetadata", this.settings.cache.albumsMetadata);
  }

  /**
   * Updates the saved metadata for the provided song.
   * @param song The song to update.
   */
  static updateSongMetadata(song: Song) {
    this.settings.cache.songsMetadata[song.key] = {
      "lastPlayedOn": song.lastPlayedOn,
      "numTimesPlayed": song.numTimesPlayed
    }

    this.updateSetting<Record<string, SongMetadata>>("cache.songsMetadata", this.settings.cache.songsMetadata);
  }

  /**
   * Handles destroying the settings.
   */
  static destroy() {
    if (this.paletteUnsub) this.paletteUnsub();
    if (this.useOledPaletteUnsub) this.useOledPaletteUnsub();
    if (this.themePrimaryColorUnsub) this.themePrimaryColorUnsub();
    
    if (this.musicDirectoriesUnsub) this.musicDirectoriesUnsub();
    if (this.selectedViewUnsub) this.selectedViewUnsub();

    if (this.showExtraSongInfoUnsub) this.showExtraSongInfoUnsub();
    if (this.circularPlayButtonUnsub) this.circularPlayButtonUnsub();
    if (this.nowPlayingThemeUnsub) this.nowPlayingThemeUnsub();
    if (this.nowPlayingUseAlbumColorsUnsub) this.nowPlayingUseAlbumColorsUnsub();
    if (this.nowPlayingMiniUseAlbumColorsUnsub) this.nowPlayingMiniUseAlbumColorsUnsub();

    if (this.dismissMiniPlayerWithSwipeUnsub) this.dismissMiniPlayerWithSwipeUnsub();
    if (this.showExtraControlsUnsub) this.showExtraControlsUnsub();
    if (this.showVolumeControlsUnsub) this.showVolumeControlsUnsub();
    
    if (this.viewsToRenderUnsub) this.viewsToRenderUnsub();

    if (this.fadeAudioOnPauseUnsub) this.fadeAudioOnPauseUnsub();
    if (this.autoPlayOnConnectUnsub) this.autoPlayOnConnectUnsub();
    if (this.autoPlayOnBluetoothUnsub) this.autoPlayOnBluetoothUnsub();

    if (this.playlistsUnsub) this.playlistsUnsub();

    if (this.queueUnsub) this.queueUnsub();
    
    if (this.blacklistedFoldersUnsub) this.blacklistedFoldersUnsub();
    if (this.pauseOnVolumeZeroUnsub) this.pauseOnVolumeZeroUnsub();
    if (this.filterSongDurationUnsub) this.filterSongDurationUnsub();
    if (this.selectedLanguageUnsub) this.selectedLanguageUnsub();

    if (this.albumsUnsub) this.albumsUnsub();
    if (this.songsUnsub) this.songsUnsub();
    if (this.artistsUnsub) this.artistsUnsub();
    if (this.songProgressUnsub) this.songProgressUnsub();
    if (this.songNameUnsub) this.songNameUnsub();
    if (this.shuffleUnsub) this.shuffleUnsub();
    if (this.isPausedUnsub) this.isPausedUnsub();
    if (this.nowPlayingListNameUnsub) this.nowPlayingListNameUnsub();
    if (this.nowPlayingTypeUnsub) this.nowPlayingTypeUnsub();

    if (this.playlistGridSizeUnsub) this.playlistGridSizeUnsub();
    if (this.playlistSortOrderUnsub) this.playlistSortOrderUnsub();

    if (this.albumGridSizeUnsub) this.albumGridSizeUnsub();
    if (this.albumSortOrderUnsub) this.albumSortOrderUnsub();
    if (this.useAlbumColorsUnsub) this.useAlbumColorsUnsub();

    if (this.songGridSizeUnsub) this.songGridSizeUnsub();
    if (this.songSortOrderUnsub) this.songSortOrderUnsub();

    if (this.artistGridSizeUnsub) this.artistGridSizeUnsub();
    if (this.artistGridStyleUnsub) this.artistGridStyleUnsub();
    if (this.artistSortOrderUnsub) this.artistSortOrderUnsub();
    if (this.useArtistColorsUnsub) this.useArtistColorsUnsub();
  }
}