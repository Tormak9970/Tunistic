<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import { tauri } from "@tauri-apps/api";

  import type { Genre } from "../../../lib/models/Genre";
  import { IMAGE_FADE_OPTIONS, TILTED_DIMENSIONS } from "../../../lib/utils/ImageConstants";
  import { RustInterop } from "../../../lib/controllers/RustInterop";

  import CardClickable from "../../layout/CardClickable.svelte";
  import Lazy from "../../layout/Lazy.svelte";
  import MusicNotePlaceholder from "../../layout/placeholders/MusicNotePlaceholder.svelte";
  

  export let genre: Genre;
  $: convertedPath = genre.imagePreviewPath ? tauri.convertFileSrc(genre.imagePreviewPath) : "";

  $: backgroundColor = genre.backgroundColor ?? "var(--m3-scheme-on-primary)";
  $: textColor = genre.textColor ?? "var(--m3-scheme-primary)";

  function goToGenre() {
    push(`/genres/${genre.name}`);
  }

  onMount(() => {
    if ((!genre.backgroundColor || !genre.textColor) && genre.imagePreviewPath) {
      RustInterop.getColorsFromImage(genre.imagePreviewPath).then((colors) => {
        if (colors.length) {
          genre.backgroundColor = colors[0];
          genre.textColor = colors[1];
        }
      });
    }
  });
</script>

<CardClickable type="transparent" on:click={goToGenre} extraOptions={{ style: "width: calc(50% - 1px); max-width: 300px; height: 100px; padding: 5px;" }}>
  <div class="genre-entry" style:--background-color={backgroundColor} style:--text-color={textColor}>
    <div class="info-container">
      <div class="name">{genre.name}</div>
      <div class="song-count">{genre.songKeys.length} Songs</div>
    </div>
    <div class="cover" style="width: {TILTED_DIMENSIONS.width}px; height: {TILTED_DIMENSIONS.height}px;">
      {#if convertedPath !== ""}
        <Lazy height={TILTED_DIMENSIONS.height} fadeOption={IMAGE_FADE_OPTIONS} let:onError>
          <!-- svelte-ignore a11y-missing-attribute -->
          <img src="{convertedPath}" style="width: {TILTED_DIMENSIONS.width}px; height: {TILTED_DIMENSIONS.height}px;" draggable="false" on:error={onError} />
          <span slot="placeholder">
            <MusicNotePlaceholder />
          </span>
        </Lazy>
      {:else}
        <MusicNotePlaceholder />
      {/if}
    </div>
  </div>
</CardClickable>

<style>
  .genre-entry {
    background-color: rgb(var(--background-color));
    color: rgb(var(--text-color));

    width: 100%;
    height: 90px;

    padding: 10px 0px 0px 10px;

    border-radius: 10px;

    position: relative;

    overflow: hidden;
  }

  .info-container {
    max-width: 65%;
  }

  .name {
    font-size: 16px;
    text-wrap: wrap;
    font-weight: bold;
  }

  .song-count {
    font-size: 14px;
  }

  .cover {
    position: absolute;
    right: -10px;
    bottom: -10px;

    transform: rotate(30deg);
  }
</style>