<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { account } from "$lib/appwrite";
  import { ID } from "appwrite";
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let loading = false;
  let error = "";

  async function handleLogin() {
    loading = true;
    error = "";
    try {
      await account.createEmailPasswordSession(email, password);
      goto("/");
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleRegister() {
    loading = true;
    error = "";
    try {
      await account.create(ID.unique(), email, password);
      await handleLogin();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col items-center justify-center h-full px-6 space-y-8">
  <div class="text-center space-y-2">
    <h1 class="text-4xl font-bold tracking-tighter text-white">span</h1>
    <p class="text-neutral-400">Dating for the modern minimalist.</p>
  </div>

  <div class="w-full max-w-sm space-y-4">
    {#if error}
      <div
        class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
      >
        {error}
      </div>
    {/if}

    <Input placeholder="Email" type="email" bind:value={email} />
    <Input placeholder="Password" type="password" bind:value={password} />

    <div class="pt-4 space-y-3">
      <Button class="w-full" on:click={handleLogin} disabled={loading}>
        {loading ? "Loading..." : "Sign In"}
      </Button>
      <Button
        class="w-full"
        variant="outline"
        on:click={handleRegister}
        disabled={loading}
      >
        Create Account
      </Button>
    </div>
  </div>
</div>
