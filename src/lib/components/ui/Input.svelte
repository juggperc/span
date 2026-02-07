<script lang="ts">
  import { twMerge } from "tailwind-merge";

  export let value: string;
  export let placeholder: string = "";
  export let type: string = "text";
  export let label: string | undefined = undefined;

  let className: string | undefined = undefined;
  export { className as class };

  $: classes = twMerge(
    "flex h-12 w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-sm ring-offset-neutral-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
    className,
  );
  let id = Math.random().toString(36).slice(2);
</script>

<div class="w-full space-y-2">
  {#if label}
    <label for={id} class="text-xs font-medium text-neutral-400 pl-1"
      >{label}</label
    >
  {/if}
  <input
    {id}
    {type}
    bind:value
    class={classes}
    {placeholder}
    {...$$restProps}
  />
</div>
