<script lang="ts">
  import { Icon, OverlayHeader } from "@component-utils";
  import { Button } from "@interactables";

  import { BackArrow } from "@icons";

  export let label: string;
  export let goBack: () => void;
</script>

<OverlayHeader highlight={false}>
  <span slot="left" style="display: flex; align-items: center;">
    <Button type="text" iconType="full" on:click={goBack}>
      <Icon icon={BackArrow} width="20px" height="20px" />
    </Button>
    <div class="font-headline" style="margin-left: 10px;">{label}</div>
  </span>
  <span slot="right" />
</OverlayHeader>