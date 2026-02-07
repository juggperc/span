<script lang="ts">
  import { twMerge } from "tailwind-merge";

  export let active: boolean = false;
  export let interactive: boolean = false;

  $: classes = twMerge(
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors",
    active
      ? "bg-white text-black border-white"
      : "bg-transparent text-neutral-400 border-neutral-700",
    interactive &&
      !active &&
      "hover:border-neutral-500 hover:text-neutral-200 cursor-pointer",
    !interactive && "cursor-default",
  );
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={classes} on:click role="button" tabindex={interactive ? 0 : -1}>
  <slot />
</div>
