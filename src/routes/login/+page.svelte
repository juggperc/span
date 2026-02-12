<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { account } from "$lib/appwrite";
  import { ID } from "appwrite";
  import { goto } from "$app/navigation";
  import { initUser } from "$lib/stores/user";
  import { Sparkles } from "lucide-svelte";

  let email = "";
  let password = "";
  let name = "";
  let loading = false;
  let error = "";
  let isRegister = false;

  async function handleLogin() {
    loading = true;
    error = "";
    try {
      await account.createEmailPasswordSession(email, password);
      await initUser();
      goto("/");
    } catch (e: any) {
      error = e.message || "Login failed";
    } finally {
      loading = false;
    }
  }

  async function handleRegister() {
    loading = true;
    error = "";
    try {
      await account.create(ID.unique(), email, password, name || undefined);
      await account.createEmailPasswordSession(email, password);
      await initUser();
      goto("/onboarding");
    } catch (e: any) {
      error = e.message || "Registration failed";
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    isRegister = !isRegister;
    error = "";
  }
</script>

<div class="flex flex-col items-center justify-center h-full px-8 space-y-8">
  <!-- Branding -->
  <div class="text-center space-y-4 animate-fade-in">
    <!-- 3D Spinning Heart -->
    <div class="heart-stage mx-auto mb-2">
      <div class="heart-3d">
        <svg viewBox="0 0 24 24" fill="url(#heart-grad)" class="h-10 w-10">
          <defs>
            <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#60a5fa" />
              <stop offset="50%" stop-color="#c084fc" />
              <stop offset="100%" stop-color="#f472b6" />
            </linearGradient>
          </defs>
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
      </div>
    </div>

    <Logo size="xl" />
    <p class="text-neutral-500 text-sm">
      {isRegister
        ? "Create your account to start connecting."
        : "Dating for the intentional."}
    </p>
  </div>

  <div
    class="w-full max-w-sm space-y-4 animate-fade-in"
    style="animation-delay: 100ms;"
  >
    {#if error}
      <div
        class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
      >
        {error}
      </div>
    {/if}

    {#if isRegister}
      <Input placeholder="Name" type="text" bind:value={name} />
    {/if}
    <Input placeholder="Email" type="email" bind:value={email} />
    <Input placeholder="Password" type="password" bind:value={password} />

    <div class="pt-4 space-y-3">
      {#if isRegister}
        <Button
          class="w-full"
          on:click={handleRegister}
          disabled={loading || !email || !password}
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      {:else}
        <Button
          class="w-full"
          on:click={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      {/if}

      <button
        class="w-full text-center text-sm text-neutral-500 hover:text-neutral-300 transition-colors py-2"
        on:click={toggleMode}
      >
        {isRegister
          ? "Already have an account? Sign in"
          : "New here? Create an account"}
      </button>
    </div>
  </div>

  <!-- Philosophy tagline -->
  <p
    class="text-[11px] text-neutral-600 text-center max-w-[240px] leading-relaxed"
  >
    20 swipes. 5 likes. One question per day.<br />
    Less choice. Better connections.
  </p>

  <p class="text-[10px] text-neutral-700 text-center tracking-wide">
    Made with <span class="text-pink-400/60">♥</span> by Span Labs
  </p>
</div>

<style>
  .heart-stage {
    perspective: 600px;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .heart-3d {
    animation:
      heart-spin 4s ease-in-out infinite,
      heart-pulse 2s ease-in-out infinite;
    transform-style: preserve-3d;
    filter: drop-shadow(0 0 12px rgba(192, 132, 252, 0.3))
      drop-shadow(0 0 24px rgba(244, 114, 182, 0.15));
  }

  @keyframes heart-spin {
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }

  @keyframes heart-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }
</style>
