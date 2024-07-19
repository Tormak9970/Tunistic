<script lang="ts">
  import GridEntry from "@layout/entries/GridEntry.svelte";
  import type { Album } from "@lib/models/Album";
  import { renderDate, t } from "@stores/Locale";
  import { inSelectMode, selected } from "@stores/Select";
  import { albumGridSize, albumSortOrder } from "@stores/State";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { push } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import { GridSize } from "../../../types/Settings";

  export let album: Album;

  $: convertedPath = album.artPath ? convertFileSrc(album.artPath) : "";
  $: highlighted = $selected.includes(album.name);
  $: size = $albumGridSize === GridSize.MEDIUM ? 40 : 60;

  /**
   * Handles when the user clicks on the entry.
   */
  function onClick() {
    if ($inSelectMode) {
      const nameIndex = $selected.indexOf(album.name);
      if (nameIndex !== -1) {
        $selected.splice(nameIndex, 1);
        $selected = [ ...$selected ];
      } else {
        $selected = [ ...$selected, album.name ];
      }
    } else {
      push(`/albums/${album.name}`);
    }
  }

  /**
   * Handles when the user selects the entry.
   */
  function select() {
    if (!$inSelectMode) {
      $selected = [ ...$selected, album.name ];
    }
  }
</script>

<GridEntry label={album.name} {highlighted} gridSize={$albumGridSize} convertedPath={convertedPath} on:click={onClick} on:hold={select}>
  <span slot="details">
    {#if $albumSortOrder === "Alphabetical"}
      <div in:fade={{ duration: 200 }}>{album.albumArtist ?? $t("UNKOWN_VALUE")}</div>
    {:else if $albumSortOrder === "Artist"}
      <div in:fade={{ duration: 200 }}>{album.albumArtist ?? $t("UNKOWN_VALUE")}</div>
    {:else if $albumSortOrder === "Year"}
      <div in:fade={{ duration: 200 }}>{album.releaseYear === -1 ? $t("UNKOWN_VALUE") : album.releaseYear}</div>
    {:else if $albumSortOrder === "Length"}
      <div in:fade={{ duration: 200 }}>{album.displayAlbumLength()}</div>
    {:else if $albumSortOrder === "Track Count"}
      <div in:fade={{ duration: 200 }}>{album.songIds.length} {album.songIds.length === 1 ? $t("TRACKS_SINGULAR_VALUE") : $t("TRACKS_PLURAL_VALUE")}</div>
    {:else if $albumSortOrder === "Most Played"}
      <div in:fade={{ duration: 200 }}>{album.numTimesPlayed}</div>
    {:else if $albumSortOrder === "Last Played"}
      <div in:fade={{ duration: 200 }}>{album.lastPlayedOn === "Never" ? $t("NEVER_VALUE") : $renderDate(album.lastPlayedOn)}</div>
    {/if}
  </span>
</GridEntry>