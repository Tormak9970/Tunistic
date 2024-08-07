<script lang="ts">
  import { DetailsBody, Icon, OverlayHeader } from "@component-utils";
  import { BackArrow } from "@icons";
  import { Button } from "@interactables";
  import { VirtualGrid } from "@layout";
  import type { Artist } from "@models";
  import { t } from "@stores/Locale";
  import { artistsMap, songs } from "@stores/State";
  import { GridSize } from "@types";
  import { GRID_IMAGE_DIMENSIONS, getAllArtistNames } from "@utils";
  import ArtistGridEntry from "@views/artists/ArtistGridEntry.svelte";
  import { onMount } from "svelte";
  import { pop } from "svelte-spa-router";
  
  const keyFunction = (entry: { data: Artist}) => `${entry.data.imagePath}${entry.data.name}${entry.data.albumNames.size}${entry.data.songIds.length}`;

  let artists: Artist[] = [];
  let highlight = false;

  onMount(() => {
    const artistNames: string[] = [];

    const sorted = $songs.sort((a, b) => a.numTimesPlayed - b.numTimesPlayed);

    for (const song of sorted) {
      if (song.albumArtist && artistNames.length < 10) {
        const artists = getAllArtistNames(song.albumArtist);
        if (!artistNames.includes(artists[0])) artistNames.push(artists[0]);
      }

      if (artistNames.length === 10) break;
    }

    artists = artistNames.map((name) => $artistsMap[name]);
  });
</script>

<DetailsBody>
  <span slot="header">
    <OverlayHeader highlight={highlight}>
      <span slot="left" style="display: flex; align-items: center; gap: 10px;">
        <Button type="text" iconType="full" on:click={pop}>
          <Icon icon={BackArrow} width="20px" height="20px" />
        </Button>
        <div class="font-headline">{$t("TOP_ARTISTS_TITLE")}</div>
      </span>
      <span slot="right" />
    </OverlayHeader>
  </span>
  <span slot="content">
    <VirtualGrid name="topArtists" saveState={false} itemHeight={GRID_IMAGE_DIMENSIONS[GridSize.LARGE].height + GRID_IMAGE_DIMENSIONS[GridSize.LARGE].infoHeight + 12} itemWidth={GRID_IMAGE_DIMENSIONS[GridSize.LARGE].width + 10} rowGap={GRID_IMAGE_DIMENSIONS[GridSize.LARGE].gap} columnGap={GRID_IMAGE_DIMENSIONS[GridSize.LARGE].gap} items={artists} keyFunction={keyFunction} bind:isScrolled={highlight} let:entry>
      <ArtistGridEntry artist={entry} />
    </VirtualGrid>
  </span>
</DetailsBody>