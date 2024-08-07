<script lang="ts">
  import { DetailsBody, Icon, OverlayHeader } from "@component-utils";
  import { PlaybackController, QueueController } from "@controllers";
  import { BackArrow, SadFace, Shuffle } from "@icons";
  import { Button, PlayButton } from "@interactables";
  import { VirtualList } from "@layout";
  import type { Song } from "@models";
  import { t } from "@stores/Locale";
  import { isPaused, nowPlayingList, songs, songsMap } from "@stores/State";
  import { shuffleSongs } from "@utils";
  import SongListEntry from "@views/songs/SongListEntry.svelte";
  import { pop } from "svelte-spa-router";

  const keyFunction = (entry: { data: Song }) => entry.data.filePath;

  $: lastPlayedSongs = [ ...$songs ].filter((song) => song.lastPlayedOn !== "Never").sort((a, b) => Date.parse(b.lastPlayedOn) - Date.parse(a.lastPlayedOn));
  $: limited = lastPlayedSongs.length > 100 ? lastPlayedSongs.slice(0, 100) : lastPlayedSongs;

  let highlight = false;

  /**
   * Plays the songs.
   */
  function playSongs() {
    if ($nowPlayingList === "last-played") {
      if (!$isPaused) {
        PlaybackController.pause();
      } else {
        PlaybackController.resume();
      }
    } else {
      const first = limited[0];
      PlaybackController.playSong(first);
      QueueController.queueSongs(limited.slice(1).map((song) => song.id));
      $nowPlayingList = "last-played";
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
    $nowPlayingList = "last-played";
  }
</script>

<DetailsBody>
  <span slot="header">
    <OverlayHeader highlight={highlight}>
      <span slot="left" style="display: flex; align-items: center; gap: 10px;">
        <Button type="text" iconType="full" on:click={pop}>
          <Icon icon={BackArrow} width="20px" height="20px" />
        </Button>
        <div class="font-headline">{$t("HISTORY_TITLE")}</div>
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
    {#if lastPlayedSongs.length > 0}
      <VirtualList name="lastPlayed" saveState={false} itemHeight={60} items={limited} keyFunction={keyFunction} bind:isScrolled={highlight} let:entry>
        <SongListEntry song={entry} detailType="Alphabetical" />
      </VirtualList>
    {:else}
      <div class="message-container">
        <Icon icon={SadFace} width="60px" height="60px" />
        <div class="font-label">{$t("NO_SONGS_PLAYED_MESSAGE")}.</div>
      </div>
    {/if}
  </span>
</DetailsBody>

<style>
  .content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .message-container {
    margin-top: 40%;
    color: rgb(var(--m3-scheme-on-secondary));
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>