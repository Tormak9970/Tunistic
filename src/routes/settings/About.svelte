<script lang="ts">
  import * as shell from "@tauri-apps/plugin-shell";
  import { pop } from "svelte-spa-router";

  import SettingsBody from "@views/settings/SettingsBody.svelte";
  import SettingsHeader from "@views/settings/SettingsHeader.svelte";
  import ButtonSetting from "@views/settings/entries/ButtonSetting.svelte";
  import TextSetting from "@views/settings/entries/TextSetting.svelte";
  
  import { BugReport, EditDocument, Help, InfoOutline, License, Person, Star } from "@icons";
  import { t } from "@stores/Locale";
</script>

<SettingsBody>
  <span slot="header" style="height: 50px;">
    <SettingsHeader label={$t("SETTINGS_ABOUT_TITLE")} goBack={pop} />
  </span>
  <span class="content" slot="content">
    <!-- svelte-ignore missing-declaration -->
    <TextSetting label={$t("SETTINGS_ABOUT_VERSION_LABEL")} description={APP_VERSION} icon={InfoOutline} />
    <TextSetting label={$t("SETTINGS_ABOUT_DEV_LABEL")} description="Travis Lane" icon={Person} />
    <ButtonSetting label={$t("SETTINGS_ABOUT_CHANGELOG_LABEL")} description={$t("SETTINGS_ABOUT_CHANGELOG_DESC")} icon={EditDocument} on:click={() => shell.open("https://github.com/Tormak9970/Svunes/blob/main/CHANGELOG.md")} />
    <ButtonSetting label={$t("SETTINGS_ABOUT_GITHUB_LABEL")} description={$t("SETTINGS_ABOUT_GITHUB_DESC")} icon={Star} on:click={() => shell.open("https://github.com/Tormak9970/Svunes")} />
    <ButtonSetting label={$t("SETTINGS_ABOUT_BUG_REPORT_LABEL")} description={$t("SETTINGS_ABOUT_BUG_REPORT_DESC")} icon={BugReport} on:click={() => shell.open("https://github.com/Tormak9970/Svunes/issues/new/choose")} />
    <ButtonSetting label={$t("SETTINGS_ABOUT_FAQ_LABEL")} description={$t("SETTINGS_ABOUT_FAQ_DESC")} icon={Help} on:click={() => shell.open("https://github.com/Tormak9970/Svunes?tab=readme-ov-file#frequently-asked-questions")} />
    <ButtonSetting label={$t("SETTINGS_ABOUT_LICENSING_LABEL")} description={$t("SETTINGS_ABOUT_LICENSING_DESC")} icon={License} on:click={() => shell.open("https://github.com/Tormak9970/Svunes/blob/main/LICENSE")} />
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