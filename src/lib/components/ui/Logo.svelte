<script lang="ts">
  export let size: "sm" | "md" | "lg" | "xl" = "md";

  const sizes = {
    sm: "h-5",
    md: "h-7",
    lg: "h-9",
    xl: "h-12",
  };
</script>

<img src="/logo.svg" alt="span" class="{sizes[size]} w-auto" />
