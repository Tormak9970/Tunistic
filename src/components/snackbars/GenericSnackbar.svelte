<script lang="ts">
  import { onDestroy } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { fly } from "svelte/transition";
  import iconX from "@ktibow/iconset-material-symbols/close";
  import Icon from "../utils/Icon.svelte";

  type SnackbarData = {
    message: string;
    closable: boolean;
    timeout: number | null;
  };

  export let extraWrapperOptions: HTMLAttributes<HTMLDivElement> = {};
  export let extraOptions: HTMLAttributes<HTMLDivElement> = {};
  
  export const show = ({ message, closable = false, timeout = 4000 }: ShowSnackbarOptions) => {
    snackbar = { message, closable, timeout };
    clearTimeout(timeoutId);

    if (timeout) {
      timeoutId = setTimeout(() => {
        snackbar = undefined;
      }, timeout);
    }
  };

  export let backgroundColor: string;
  export let textColor: string;

  let snackbar: SnackbarData | undefined;
  let timeoutId: number;
  
  onDestroy(() => {
    clearTimeout(timeoutId);
  });
</script>

{#if snackbar}
  <div class="holder" in:fly={{ y: 100, duration: 300 }} out:fly={{ y: 100, duration: 400 }} {...extraWrapperOptions}>
    <div class="m3-container" style:--background-color={backgroundColor} style:--text-color={textColor} {...extraOptions}>
      <p class="m3-font-body-medium">{snackbar.message}</p>
      {#if snackbar.closable}
        <button class="close" on:click={() => { snackbar = undefined; }}>
          <Icon icon={iconX} />
        </button>
      {/if}
      </div>
  </div>
{/if}

<style>
  :root {
    --m3-snackbar-shape: var(--m3-util-rounding-extra-small);
  }

  .holder {
    position: fixed;
    padding-bottom: 1rem;
    bottom: var(--m3-util-bottom-offset);
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 3;
  }
  p {
    margin-right: auto;
  }

  .m3-container {
    display: flex;
    align-items: center;
    padding: 0 1rem;
    min-width: 20rem;
    max-width: 60rem;
    min-height: 3rem;
    border-radius: var(--m3-snackbar-shape);
    box-shadow: var(--m3-util-elevation-3);
    background-color: rgb(var(--background-color));
    color: rgb(var(--text-color));
  }

  button {
    display: flex;
    align-self: stretch;
    align-items: center;
    margin: 0;
    padding: 0;
    border: none;

    background-color: transparent;
    color: rgb(var(--text-color));
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
    transition: all 200ms;
  }
  button :global(svg) {
    width: 1.5rem;
    height: 1.5rem;
  }

  .close {
    padding: 0 0.75rem;
    margin-right: -1rem;
  }
  @media (hover: hover) {
    button:hover {
      background-color: rgb(var(--text-color) / 0.08);
    }
  }
  button:focus-visible,
  button:active {
    background-color: rgb(var(--text-color) / 0.12);
  }
</style>