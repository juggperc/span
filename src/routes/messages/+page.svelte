<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import { MessageCircle } from "lucide-svelte";
</script>

<div class="h-full w-full flex flex-col p-4 pt-8">
  <h1 class="text-2xl font-bold mb-6 text-white px-2">Messages</h1>

  <div class="flex-1 flex items-center justify-center pb-24">
    <div class="text-center space-y-4 animate-fade-in">
      <div
        class="h-20 w-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto"
      >
        <MessageCircle size={32} class="text-neutral-600" />
      </div>
      <h2 class="text-lg font-semibold text-neutral-300">No messages yet</h2>
      <p class="text-sm text-neutral-500 max-w-[240px] mx-auto leading-relaxed">
        When you match with someone, your conversation will appear here.
      </p>
    </div>
  </div>

  <Navbar />
</div>
