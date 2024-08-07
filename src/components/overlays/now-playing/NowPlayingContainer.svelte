<script lang="ts">
  import { showMiniPlayer, showNowPlaying } from "@stores/Overlays";
  import { dismissMiniPlayerWithSwipe, showNav } from "@stores/State";
  import { onDestroy, onMount } from "svelte";
  import { drag } from "svelte-gesture";
  import { spring, tweened } from "svelte/motion";
  import type { Unsubscriber } from "svelte/store";
  import { fly } from "svelte/transition";
  import MiniPlayer from "./MiniPlayer.svelte";
  import NowPlaying from "./NowPlaying.svelte";
  
  let showViewNavUnsub: Unsubscriber;
  let showMiniPlayerUnsub: Unsubscriber;

  let hasMounted = false;
  let hasDragged = false;
  let bottom = tweened(window.innerHeight - ($showNav ? 115 : 60), { duration: 200 });
  const dragHeight = spring(0, {});

  const openThreshold = -20;
  const closeThreshold = 20;
  const minimizeThreshold = 100;
  $: clampedHeight = Math.max(openThreshold, Math.min($dragHeight, 0));

  function handleDrag({ detail }: any) {
		const { active, movement: [_, my] } = detail;

    if (Math.abs(my) > 5) hasDragged = true;

    if (my < 0 && !$showMiniPlayer) return;

    const shouldShowFull = my < openThreshold;
    if (shouldShowFull && !active) {
      $showMiniPlayer = false;
      dragHeight.set(my);
      return;
    }

    const shouldClear = my > closeThreshold;
    if (shouldClear && $showMiniPlayer && $dismissMiniPlayerWithSwipe && !active) {
      $showNowPlaying = false;
      dragHeight.set(my);
      return;
    }

    const shouldMinimize = my > minimizeThreshold;
    if (shouldMinimize && !$showMiniPlayer && !active) {
      $showMiniPlayer = true;
      hasDragged = false;
      return;
    }

		dragHeight.set(active ? my : 0);
	}
  
  onMount(() => {
    showViewNavUnsub = showNav.subscribe((show) => {
      if ($showMiniPlayer) $bottom = window.innerHeight - (show ? 115 : 60);
    });
    showMiniPlayerUnsub = showMiniPlayer.subscribe((show) => {
      if (!show) {
        bottom = tweened($bottom + $dragHeight, { duration: 200 });
        dragHeight.set(0, { hard: true });
        $bottom = 0;
      } else if (show && hasMounted) {
        bottom = tweened(window.innerHeight - ($showNav ? 115 : 60) - 30, { duration: 200 });
        dragHeight.set(0, { hard: true });
        $bottom = window.innerHeight - ($showNav ? 115 : 60);
      }
    });
    hasMounted = true;
  });

  onDestroy(() => {
    if (showViewNavUnsub) showViewNavUnsub();
    if (showMiniPlayerUnsub) showMiniPlayerUnsub();
  });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="holder" use:drag on:drag={handleDrag} style:top="{$bottom + $dragHeight}px" transition:fly={{ y: 200, duration: 400 }}>
  {#if $showMiniPlayer}
    <MiniPlayer clampedHeight={clampedHeight} bind:hasDragged />
  {/if}
  <NowPlaying clampedHeight={!$showMiniPlayer ? -20 : clampedHeight} />
</div>

<style>
  .holder {
    width: 100%;
    height: 100%;

    position: absolute;
    
    background-color: transparent;
    z-index: 3;

    touch-action: none;
  }
</style>