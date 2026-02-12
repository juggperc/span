<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { initUser, isLoading, isAuthenticated } from "$lib/stores/user";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { log } from "$lib/logger";

  // Public routes that don't require auth
  const PUBLIC_ROUTES = ["/login", "/onboarding"];

  onMount(async () => {
    if (browser) {
      await initUser();
    }
  });

  // Auth guard — redirect to login if not authenticated
  $: if (browser && !$isLoading) {
    log(
      "[Layout] isLoading =",
      $isLoading,
      "isAuthenticated =",
      $isAuthenticated,
      "Path =",
      $page.url.pathname,
    );
    const isPublic = PUBLIC_ROUTES.includes($page.url.pathname);
    if (!$isAuthenticated && !isPublic) {
      goto("/login");
    } else if ($isAuthenticated && $page.url.pathname === "/login") {
      goto("/");
    }
  }
</script>

{#if $isLoading}
  <!-- Auth loading state -->
  <div
    class="font-geist min-h-screen bg-black text-white flex items-center justify-center"
  >
    <div class="flex flex-col items-center gap-4 animate-fade-in">
      <Logo size="lg" />
      <div class="h-1 w-16 bg-neutral-800 rounded-full overflow-hidden">
        <div class="h-full w-8 bg-white/30 rounded-full loading-bar"></div>
      </div>
    </div>
  </div>
{:else}
  <div
    class="font-geist min-h-screen bg-black text-white flex flex-col items-center justify-center"
  >
    <!-- Desktop: wider container with desktop-friendly proportions -->
    <div class="app-shell">
      <slot />
    </div>
  </div>
{/if}

<style>
  @keyframes loading-bar {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(200%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .loading-bar {
    animation: loading-bar 1.2s ease-in-out infinite;
  }

  /* Mobile-first: full screen */
  .app-shell {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    position: relative;
    background: rgba(24, 24, 27, 0.5);
    backdrop-filter: blur(60px);
    -webkit-backdrop-filter: blur(60px);
    overflow: hidden;
  }

  /* Tablet: centered card */
  @media (min-width: 640px) {
    .app-shell {
      max-width: 430px;
      height: 850px;
      border-radius: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.03);
    }
  }

  /* Desktop: expand to comfortable width */
  @media (min-width: 1024px) {
    .app-shell {
      max-width: 480px;
      height: 90vh;
      max-height: 920px;
    }
  }

  /* Wide desktop: side-by-side ready */
  @media (min-width: 1440px) {
    .app-shell {
      max-width: 520px;
    }
  }
</style>
