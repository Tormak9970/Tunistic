<script lang="ts">
  import { Lazy, MusicNotePlaceholder } from "@layout";
  import { convertFileSrc } from "@tauri-apps/api/core";

  export let images: (string | undefined)[];
  export let size: number;
  export let gap: number;
  export let iconSize: number;

  let imagesToRender: (string | undefined)[] = [];

  $: if (images.length === 3) {
    imagesToRender = [
      images[0], images[1], images[2],
      images[2], images[0], images[1],
      images[1], images[2], images[0]
    ];
  } else if (images.length === 6) {
    imagesToRender = [
      images[0], images[1], images[2],
      images[3], images[4], images[5],
      images[1], images[2], images[3]
    ];
  } else {
    for (let i = 0; i < 9; i++) {
      imagesToRender.push(images[i % images.length]);
    }
  }

  $: converted = imagesToRender.map((image) => image ? convertFileSrc(image) : image);
</script>

<div class="grid-container" style:--gap={gap + "px"}>
  {#key size}
    {#each converted as image}
      <div class="image-container" style="width: {size}px; height: {size}px;">
        <Lazy height={size} src="{image ?? ""}">
          <MusicNotePlaceholder width={iconSize} height={iconSize} />
        </Lazy>
      </div>
    {/each}
  {/key}
</div>

<style>
  .grid-container {
    height: fit-content;
    width: fit-content;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--gap);

    background-color: rgb(var(--m3-scheme-surface-container-high));

    transform: rotate(10deg);
    translate: -10% -10%;
  }

  .image-container {
    border-radius: 4px;
    overflow: hidden;
  }
</style>