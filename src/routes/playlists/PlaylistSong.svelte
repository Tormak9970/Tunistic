<script lang="ts">
  import { tauri } from "@tauri-apps/api";
  import CardClickable from "../../components/layout/CardClickable.svelte";
  import Lazy from "../../components/layout/Lazy.svelte";
  import MusicNotePlaceholder from "../../components/layout/placeholders/MusicNotePlaceholder.svelte";
  import { IMAGE_FADE_OPTIONS, LIST_IMAGE_DIMENSIONS } from "../../lib/utils/ImageConstants";
  import MoreVert from "@ktibow/iconset-material-symbols/more-vert";
  import type { Song } from "../../lib/models/Song";
  import { inSelectMode, selected } from "../../stores/Select";
  import { PlaybackController } from "../../lib/controllers/PlaybackController";
  import MenuButton from "../../components/interactables/MenuButton.svelte";
  import SongOptions from "../../components/views/songs/SongOptions.svelte";

  export let song: Song;

  $: convertedPath = song.artPath ? tauri.convertFileSrc(song.artPath) : "";
  $: highlighted = $selected.includes(song.key);

  /**
   * Handles when the user clicks on the entry.
   */
  function onClick(e: MouseEvent) {
    if ($inSelectMode) {
      const titleIndex = $selected.indexOf(song.key);
      if (titleIndex !== -1) {
        $selected.splice(titleIndex, 1);
        $selected = [ ...$selected ];
      } else {
        $selected = [ ...$selected, song.key ];
      }
    } else {
      PlaybackController.playSong(song);
    }
  }

  /**
   * Handles when the user selects the entry.
   */
  function select() {
    if (!$inSelectMode) {
      $selected = [ ...$selected, song.key ];
    }
  }
  
  let menuIsOpen = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<CardClickable type="transparent" highlight={highlighted} on:click={onClick} on:hold={select} extraOptions={{ style: "width: 100%; display: flex; position: relative; padding: 10px 0px; border-radius: 10px; margin: 2px 0px;" }}>
  <div class="content">
    <div class="left">
      <div class="album">
        {#if convertedPath !== ""}
          <Lazy height={LIST_IMAGE_DIMENSIONS.height} fadeOption={IMAGE_FADE_OPTIONS} let:onError>
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src="{convertedPath}" style="width: {LIST_IMAGE_DIMENSIONS.width}px; height: {LIST_IMAGE_DIMENSIONS.height}px;" draggable="false" on:error={onError} />
            <span slot="placeholder">
              <MusicNotePlaceholder />
            </span>
          </Lazy>
        {:else}
          <MusicNotePlaceholder />
        {/if}
      </div>
      <div class="info">
        <div class="name">
          {song.title}
        </div>
        <div class="secondary">
          <div class="artist">
            {song.artist ?? "Unkown"}
          </div>
        </div>
      </div>
    </div>
    <div class="options">
      <MenuButton icon={MoreVert} bind:open={menuIsOpen}>
        <SongOptions bind:menuIsOpen={menuIsOpen} song={song} />
      </MenuButton>
    </div>
  </div>
</CardClickable>

<style>
  .content {
    width: 100%; 
    display: flex;
    align-items: center;
  }

  .left {
    display: flex;
    align-items: center;
    width: calc(100% - 40px);
  }

  .info {
    width: calc(100% - 75px);
  }

  .name {
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .secondary {
    color: rgb(var(--m3-scheme-outline));
    font-size: 14px;
    
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .album {
    border-radius: 4px;
    overflow: hidden;
    height: 40px;
    width: 40px;

    margin-left: 10px;
    margin-right: 15px;
  }
</style>