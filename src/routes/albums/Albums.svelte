<script lang="ts">
  import { albumSortOrder, albums, albumGridSize } from "../../stores/State";
  import ViewContainer from "../../components/views/utils/ViewContainer.svelte";
  import ListEntry from "../../components/views/albums/ListEntry.svelte";
  import GridEntry from "../../components/views/albums/GridEntry.svelte";
  import AlbumsHeader from "../../components/views/albums/AlbumsHeader.svelte";
  import VirtualList from "../../components/layout/VirtualList.svelte";
  import VirtualGrid from "../../components/layout/VirtualGrid.svelte";
  import { GridSize, type AlbumSortOrder } from "../../types/Settings";
  import { GRID_IMAGE_DIMENSIONS } from "../../lib/utils/ImageConstants";
  import { LogController } from "../../lib/controllers/LogController";
  import { dateSort, stringSort } from "../../lib/utils/Utils";
  import SadFace from "@ktibow/iconset-material-symbols/sentiment-dissatisfied-outline-rounded";
  import { Icon } from "m3-svelte";
  import type { Album } from "../../lib/models/Album";

  let isAtTop = true;

  const keyFunction = (entry: { data: Album}) => `${entry.data.artPath}${entry.data.name}${entry.data.releaseYear}${entry.data.songKeys.length}${entry.data.lastPlayedOn}`;

  /**
   * Sorts the albums.
   * @param albumsList The list of albums.
   * @param albumOrder The order to sort by.
   * @returns The sorted list.
   */
  function sortAlbums(albumsList: Album[], sortOrder: AlbumSortOrder): Album[] {
    let sorted: Album[] = [];
    if (sortOrder === "Alphabetical") {
      sorted = albumsList.sort(stringSort<Album>("name"));
    } else if (sortOrder === "Artist") {
      sorted = albumsList.sort(stringSort<Album>("albumArtist"));
    } else if (sortOrder === "Year") {
      sorted = albumsList.sort((a: Album, b: Album) => b.releaseYear - a.releaseYear);
    } else if (sortOrder === "Length") {
      sorted = albumsList.sort((a: Album, b: Album) => b.albumLength - a.albumLength);
    } else if (sortOrder === "Track Count") {
      sorted = albumsList.sort((a: Album, b: Album) => b.songKeys.length - a.songKeys.length);
    } else if (sortOrder === "Most Played") {
      sorted = albumsList.sort((a: Album, b: Album) => b.numTimesPlayed - a.numTimesPlayed);
    } else if (sortOrder === "Last Played") {
      sorted = albumsList.sort(dateSort("lastPlayedOn"));
    } else {
      LogController.error("Unkown song sort order!");
      sorted = [];
    }
    return sorted;
  }

  $: sortedAlbums = sortAlbums($albums, $albumSortOrder);
</script>

<ViewContainer>
  <div slot="header">
    <AlbumsHeader highlight={!isAtTop} />
  </div>
  <div slot="content" style="height: 100%; width: 100%;">
    {#if sortedAlbums.length > 0}
      {#if $albumGridSize === GridSize.LIST}
        <VirtualList itemHeight={60} items={sortedAlbums} keyFunction={keyFunction} bind:isAtTop={isAtTop} let:entry>
          <ListEntry album={entry} />
        </VirtualList>
      {:else}
        <VirtualGrid itemHeight={GRID_IMAGE_DIMENSIONS[$albumGridSize].height + GRID_IMAGE_DIMENSIONS[$albumGridSize].infoHeight + 12} itemWidth={GRID_IMAGE_DIMENSIONS[$albumGridSize].width + 10} rowGap={GRID_IMAGE_DIMENSIONS[$albumGridSize].gap} columnGap={GRID_IMAGE_DIMENSIONS[$albumGridSize].gap} items={sortedAlbums} keyFunction={keyFunction} bind:isAtTop={isAtTop} let:entry>
          <GridEntry album={entry} />
        </VirtualGrid>
      {/if}
    {:else}
      <div class="message-container">
        <Icon icon={SadFace} width="60px" height="60px" />
        <div class="message">No albums found. Try adding music folders in settings</div>
      </div>
    {/if}
  </div>
</ViewContainer>

<style>
  .message-container {
    margin-top: 40%;
    color: rgb(var(--m3-scheme-on-secondary));
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .message {
    max-width: 300px;
    font-size: 18px;
    text-align: center;
  }
</style>