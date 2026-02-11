<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import Button from "$lib/components/ui/Button.svelte";
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
      goto("/profile");
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

<div class="flex flex-col items-center justify-center h-full px-6 space-y-8">
  <!-- Branding -->
  <div class="text-center space-y-3 animate-fade-in">
    <div
      class="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4"
    >
      <Sparkles size={28} class="text-white/70" />
    </div>
    <h1 class="text-4xl font-bold tracking-tighter text-white">span</h1>
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
</div>
