<script lang="ts">
  import DetailsBody from "@component-utils/DetailsBody.svelte";
  import Icon from "@component-utils/Icon.svelte";
  import Button from "@interactables/Button.svelte";
  import BackArrow from "@ktibow/iconset-material-symbols/arrow-back-rounded";
  import Shuffle from "@ktibow/iconset-material-symbols/shuffle-rounded";
  import VirtualList from "@layout/VirtualList.svelte";
  import { PlaybackController } from "@lib/controllers/PlaybackController";
  import { QueueController } from "@lib/controllers/QueueController";
  import type { Song } from "@lib/models/Song";
  import { shuffleSongs } from "@lib/utils/Shuffle";
  import OverlayHeader from "@overlays/utils/OverlayHeader.svelte";
  import { isPaused, nowPlayingList, songs, songsMap } from "@stores/State";
  import ListEntry from "@views/songs/ListEntry.svelte";
  import PlayButton from "@views/utils/PlayButton.svelte";
  import { pop } from "svelte-spa-router";

  const keyFunction = (entry: { data: Song }) => entry.data.filePath;

  $: recentlyAddedSongs = [ ...$songs ].sort((a, b) => Date.parse(b.dateAdded!) - Date.parse(a.dateAdded!));
  $: limited = recentlyAddedSongs.length > 100 ? recentlyAddedSongs.slice(0, 100) : recentlyAddedSongs;

  let isAtTop = true;

  /**
   * Plays the songs.
   */
  function playSongs() {
    if ($nowPlayingList === "recently-added") {
      if (!$isPaused) {
        PlaybackController.pause();
      } else {
        PlaybackController.resume();
      }
    } else {
      const first = limited[0];
      PlaybackController.playSong(first);
      QueueController.queueSongs(limited.slice(1).map((song) => song.id));
      $nowPlayingList = "recently-added";
    }
  }
  
  /**
   * Shuffles then plays the songs.
   */
  function playShuffled() {
    const shuffled = shuffleSongs(limited.map((song) => song.id));
    const first = $songsMap[shuffled[0]];
    PlaybackController.playSong(first);
    QueueController.queueSongs(shuffled.slice(1));
    $nowPlayingList = "recently-added";
  }
</script>

<DetailsBody bind:isAtTop={isAtTop}>
  <span slot="header">
    <OverlayHeader highlight={!isAtTop}>
      <span slot="left" style="display: flex; align-items: center; gap: 10px;">
        <Button type="text" iconType="full" on:click={pop}>
          <Icon icon={BackArrow} width="20px" height="20px" />
        </Button>
        <div style="font-size: 20px;">Recently Added</div>
      </span>
      <span slot="right" style="display: flex; flex-direction: row; gap: 5px">
        <PlayButton type="text" name="recently-added" on:click={playSongs} />
        <Button type="text" iconType="full" on:click={playShuffled}>
          <Icon icon={Shuffle} width="20px" height="20px" />
        </Button>
      </span>
    </OverlayHeader>
  </span>
  <span class="content" slot="content">
    <VirtualList name="recentlyAdded" saveState={false} itemHeight={60} items={limited} keyFunction={keyFunction} bind:isAtTop={isAtTop} let:entry>
      <ListEntry song={entry} detailType="Alphabetical" />
    </VirtualList>
  </span>
</DetailsBody>

<style>
  .content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 70px;
  }
</style>