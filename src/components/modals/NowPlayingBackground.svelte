<script lang="ts">
  import { SmallModalBody } from "@component-utils";
  import { RadioInput } from "@interactables";
  import { t } from "@stores/Locale";
  import { showNowPlayingBackground } from "@stores/Modals";
  import { nowPlayingBackgroundType } from "@stores/State";
  import { NowPlayingBackgroundType, getNowPlayingBackgroundType } from "@types";

  let open = true;

  /**
   * Sets the now playing background type.
   * @param backgroundType The new background type.
   */
  function setBackgroundType(backgroundType: NowPlayingBackgroundType) {
    $nowPlayingBackgroundType = backgroundType;
    open = false;
  }

  const backgroundTypes: NowPlayingBackgroundType[] = Object.values(NowPlayingBackgroundType).filter((v) => !isNaN(Number(v))) as NowPlayingBackgroundType[];
</script>

<SmallModalBody headline={$t("NOW_PLAYING_BACKGROUND_TYPE_TITLE")} open={open} on:close={() => open = false} on:closeEnd={() => $showNowPlayingBackground = false}>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <div class="content">
    {#each backgroundTypes as backgroundType}
      <label style="height: 2.5rem;">
        <RadioInput name="nowPlayingBackground" checked={$nowPlayingBackgroundType === backgroundType} on:input={() => setBackgroundType(backgroundType)} />
        <div class="radio font-label">{getNowPlayingBackgroundType(backgroundType)}</div>
      </label>
    {/each}
  </div>
</SmallModalBody>

<style>
  .content {
    display: flex;
    flex-direction: column;
  }

  label {
    display: flex;
    align-items: center;
  }

  .radio {
    margin-left: 5px;
  }
</style>