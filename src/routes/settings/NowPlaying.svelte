<script lang="ts">
  import { showNowPlayingBackground, showNowPlayingTheme } from "@stores/Modals";
  import { dismissMiniPlayerWithSwipe, extraControl, nowPlayingBackgroundType, nowPlayingTheme, showExtraSongInfo, showVolumeControls } from "@stores/State";
  import { getNowPlayingBackgroundType, getNowPlayingTheme, type NowPlayingExtraControl } from "@types";
  import { pop } from "svelte-spa-router";

  import { MultiButton } from "@interactables";
  import SettingsBody from "@views/settings/SettingsBody.svelte";
  import SettingsHeader from "@views/settings/SettingsHeader.svelte";
  import ButtonSetting from "@views/settings/entries/ButtonSetting.svelte";
  import MultiButtonSetting from "@views/settings/entries/MultiButtonSetting.svelte";
  import ToggleSetting from "@views/settings/entries/ToggleSetting.svelte";
  
  import { Bedtime, DirectionsCar, HideSource, Imagesmode, PlayCircle, SwipeDownAlt, VolumeUp } from "@icons";
  import { SectionLabel } from "@layout";
  import { t } from "@stores/Locale";

  function setAdditionalControl(control: NowPlayingExtraControl) {
    $extraControl = control;
  }
</script>

<SettingsBody>
  <span slot="header" style="height: 50px;">
    <SettingsHeader label={$t("SETTINGS_NOW_PLAYING_TITLE")} goBack={pop} />
  </span>
  <span class="content" slot="content">
    <ButtonSetting label={$t("SETTINGS_NOW_PLAYING_THEME_LABEL")} description={getNowPlayingTheme($nowPlayingTheme)} icon={PlayCircle} on:click={() => $showNowPlayingTheme = true} />
    <ButtonSetting label={$t("SETTINGS_NOW_PLAYING_BACKGROUND_LABEL")} description={getNowPlayingBackgroundType($nowPlayingBackgroundType)} icon={Imagesmode} on:click={() => $showNowPlayingBackground = true} />
    <ToggleSetting label={$t("SETTINGS_NOW_PLAYING_EXTRA_INFO_LABEL")} description={$t("SETTINGS_NOW_PLAYING_EXTRA_INFO_DESC")} bind:checked={$showExtraSongInfo} />
    <SectionLabel label={$t("SETTINGS_NOW_PLAYING_CONTROLS_LABEL")} />
    <ToggleSetting label={$t("SETTINGS_NOW_PLAYING_SWIPE_DOWN_LABEL")} description={$t("SETTINGS_NOW_PLAYING_SWIPE_DOWN_DESC")} icon={SwipeDownAlt} bind:checked={$dismissMiniPlayerWithSwipe} />
    <ToggleSetting label={$t("SETTINGS_NOW_PLAYING_VOLUME_LABEL")} description={$t("SETTINGS_NOW_PLAYING_VOLUME_DESC")} icon={VolumeUp} bind:checked={$showVolumeControls} />
    <MultiButtonSetting label={$t("SETTINGS_NOW_PLAYING_ADDITIONAL_LABEL")} description={$t("SETTINGS_NOW_PLAYING_ADDITIONAL_DESC")}>
      <MultiButton name="additional-control" id="carMode" icon={DirectionsCar} checked={$extraControl === "Car Mode"} on:input={() => setAdditionalControl("Car Mode")}>{$t("SETTINGS_NOW_PLAYING_ADDITIONAL_CAR_MODE")}</MultiButton>
      <MultiButton name="additional-control" id="sleepTimer" icon={Bedtime} checked={$extraControl === "Sleep Timer"} on:input={() => setAdditionalControl("Sleep Timer")}>{$t("SETTINGS_NOW_PLAYING_ADDITIONAL_SLEEP")}</MultiButton>
      <MultiButton name="additional-control" id="none" icon={HideSource} checked={$extraControl === "None"} on:input={() => setAdditionalControl("None")}>{$t("SETTINGS_NOW_PLAYING_ADDITIONAL_NONE")}</MultiButton>
    </MultiButtonSetting>
  </span>
</SettingsBody>

<style>
  .content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>