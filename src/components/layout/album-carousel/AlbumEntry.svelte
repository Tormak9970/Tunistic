<script lang="ts">
  import type { Album } from "@models";
  import { t } from "@stores/Locale";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { getContextMenuItems } from "@views/albums/AlbumOptions.svelte";
  import { push } from "svelte-spa-router";
  import CardClickable from "../CardClickable.svelte";
  import Lazy from "../Lazy.svelte";
  import MusicNotePlaceholder from "../placeholders/MusicNotePlaceholder.svelte";

  export let album: Album;

  let size = 150;

  $: convertedPath = album.artPath ? convertFileSrc(album.artPath) : "";
  
  $: ctxMenuItems = getContextMenuItems(album, $t);

  /**
   * Handles when the user clicks on the entry.
   */
  function onClick() {
    push(`/albums/${album.name}`);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<CardClickable
  type="transparent"
  ctxMenuId="album-options"
  ctxMenuItems={ctxMenuItems}
  on:click={onClick}
  holdable={false}
  extraOptions={{
    style: `width: ${size + 10}px; display: flex; align-items: center; position: relative; padding: 5px; border-radius: 10px; margin: 0px;`
  }}
>
  <div class="content">
    <div class="album" style="width: {size}px; height: {size}px;">
      {#if convertedPath !== ""}
        <Lazy height={size} src="{convertedPath}">
          <MusicNotePlaceholder />
        </Lazy>
      {:else}
        <MusicNotePlaceholder />
      {/if}
    </div>
    <div class="bottom" style="height: {50}px;">
      <div class="font-label info">
        {album.name}
      </div>
    </div>
  </div>
</CardClickable>

<style>
  .content {
    width: calc(100% - 10px); 
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .bottom {
    padding-top: 9px;
    padding-bottom: 4px;
    width: calc(100% - 20px);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .info {
    margin-right: 0px;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .album {
    border-radius: 10px;
    overflow: hidden;
  }
</style>