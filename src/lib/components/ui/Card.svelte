<script lang="ts">
  import { twMerge } from "tailwind-merge";

  let className: string | undefined = undefined;
  export { className as class };

  $: classes = twMerge(
    "relative w-full h-full overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl",
    className,
  );
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
