<script lang="ts">
  import { DetailsBody, Icon, OverlayHeader } from "@component-utils";
  import { PlaybackController, QueueController } from "@controllers";
  import { BackArrow, Shuffle } from "@icons";
  import { Button, PlayButton } from "@interactables";
  import { VirtualList } from "@layout";
  import type { Song } from "@models";
  import { t } from "@stores/Locale";
  import { isPaused, nowPlayingList, songs, songsMap } from "@stores/State";
  import { shuffleSongs } from "@utils";
  import SongListEntry from "@views/songs/SongListEntry.svelte";
  import { pop } from "svelte-spa-router";

  const keyFunction = (entry: { data: Song }) => entry.data.filePath;

  $: mostPlayedSongs = [ ...$songs ].sort((a, b) => a.numTimesPlayed - b.numTimesPlayed);
  $: limited = mostPlayedSongs.length > 100 ? mostPlayedSongs.slice(0, 100) : mostPlayedSongs;

  let highlight = false;

  /**
   * Plays the songs.
   */
  function playSongs() {
    if ($nowPlayingList === "most-played") {
      if (!$isPaused) {
        PlaybackController.pause();
      } else {
        PlaybackController.resume();
      }
    } else {
      const first = limited[0];
      PlaybackController.playSong(first);
      QueueController.queueSongs(limited.slice(1).map((song) => song.id));
      $nowPlayingList = "most-played";
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
    $nowPlayingList = "most-played";
  }
</script>

<DetailsBody>
  <span slot="header">
    <OverlayHeader highlight={highlight}>
      <span slot="left" style="display: flex; align-items: center; gap: 10px;">
        <Button type="text" iconType="full" on:click={pop}>
          <Icon icon={BackArrow} width="20px" height="20px" />
        </Button>
        <div class="font-headline">{$t("MOST_PLAYED_TITLE")}</div>
      </span>
      <span slot="right" style="display: flex; flex-direction: row; gap: 5px">
        <PlayButton type="text" name="most-played" on:click={playSongs} />
        <Button type="text" iconType="full" on:click={playShuffled}>
          <Icon icon={Shuffle} width="20px" height="20px" />
        </Button>
      </span>
    </OverlayHeader>
  </span>
  <span class="content" slot="content">
    <VirtualList name="mostPlayed" saveState={false} itemHeight={60} items={limited} keyFunction={keyFunction} bind:isScrolled={highlight} let:entry>
      <SongListEntry song={entry} detailType="Alphabetical" />
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
  }
</style>