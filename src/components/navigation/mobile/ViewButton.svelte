<script lang="ts">
  import IconButton from "../../interactables/IconButton.svelte";
  
  import QueueMusic from "svelte-icons/md/MdQueueMusic.svelte";
  import Album from "svelte-icons/md/MdAlbum.svelte";
  import MusicNote from "svelte-icons/md/MdMusicNote.svelte";
  import Artist from "../../icons/Artist.svelte";
  import LibraryMusic from "svelte-icons/md/MdLibraryMusic.svelte";
  import Settings from "svelte-icons/md/MdSettings.svelte";
  import { View } from "../../../types/View";
    import { selectedView } from "../../../stores/State";

  export let view: View;
  export let onSelect: (view: View) => void;

  const views = {
    playlists: View.PLAYLISTS,
    albumns: View.ALBUMS,
    songs: View.SONGS,
    genres: View.GENRES,
    artists: View.ARTISTS,
    settings: View.SETTINGS
  }
</script>

<IconButton width="60px" onClick={() => onSelect(view)} selected={$selectedView === view}>
  {#if view === views.playlists}
    <QueueMusic />
  {:else if view === views.albumns}
    <Album />
  {:else if view === views.songs}
    <MusicNote />
  {:else if view === views.genres}
    <LibraryMusic />
  {:else if view === views.artists}
    <Artist />
  {:else if view === views.settings}
    <Settings />
  {/if}
</IconButton>