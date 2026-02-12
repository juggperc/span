<script lang="ts">
  export let size: "sm" | "md" | "lg" | "xl" = "md";

  const sizes = {
    sm: { fontSize: "20px", letterSpacing: "-1.2px" },
    md: { fontSize: "26px", letterSpacing: "-1.5px" },
    lg: { fontSize: "34px", letterSpacing: "-2px" },
    xl: { fontSize: "44px", letterSpacing: "-2.5px" },
  };

  $: style = sizes[size];
</script>

<span
  class="logo-text"
  style="font-size: {style.fontSize}; letter-spacing: {style.letterSpacing};"
  aria-label="span"
>
  <span class="logo-s">s</span><span class="logo-p">p</span><span class="logo-a"
    >a</span
  ><span class="logo-n">n</span>
</span>

<style>
  .logo-text {
    font-family:
      "Geist",
      system-ui,
      -apple-system,
      sans-serif;
    font-weight: 700;
    line-height: 1;
    display: inline-flex;
    user-select: none;
  }

  .logo-s {
    color: #60a5fa; /* blue-400 */
  }

  .logo-p {
    background: linear-gradient(135deg, #60a5fa 0%, #c084fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .logo-a {
    background: linear-gradient(135deg, #c084fc 0%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .logo-n {
    color: #f472b6; /* pink-400 */
  }
</style>
