<script lang="ts">
  import { showEditViewOrder } from "@stores/Modals";
  import { showSuggestions, trackHistory } from "@stores/State";
  import { pop } from "svelte-spa-router";

  import SettingsBody from "@views/settings/SettingsBody.svelte";
  import SettingsHeader from "@views/settings/SettingsHeader.svelte";
  import ButtonSetting from "@views/settings/entries/ButtonSetting.svelte";
  import ToggleSetting from "@views/settings/entries/ToggleSetting.svelte";
  
  import { History, LibraryMusic } from "@icons";
  import { SectionLabel } from "@layout";
  import { t } from "@stores/Locale";
</script>

<SettingsBody>
  <span slot="header" style="height: 50px;">
    <SettingsHeader label={$t("SETTINGS_PERSONALIZE_TITLE")} goBack={pop} />
  </span>
  <span class="content" slot="content">
    <SectionLabel label={$t("SETTINGS_PERSONALIZE_HOME_LABEL")} />
    <!-- svelte-ignore missing-declaration -->
    {#if IS_MOBILE}
      <ToggleSetting label={$t("SETTINGS_PERSONALIZE_SUGGESTIONS_LABEL")} description={$t("SETTINGS_PERSONALIZE_SUGGESTIONS_DESC")} bind:checked={$showSuggestions} />
    {/if}
    <ToggleSetting label={$t("SETTINGS_PERSONALIZE_TRACK_HISTORY_LABEL")} description={$t("SETTINGS_PERSONALIZE_TRACK_HISTORY_DESC")} icon={History} bind:checked={$trackHistory} />
    <SectionLabel label={$t("SETTINGS_PERSONALIZE_LIBRARY_LABEL")} />
    <ButtonSetting label={$t("SETTINGS_PERSONALIZE_CATEGORIES_LABEL")} description={$t("SETTINGS_PERSONALIZE_CATEGORIES_DESC")} icon={LibraryMusic} on:click={() => $showEditViewOrder = true} />
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