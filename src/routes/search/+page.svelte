<script lang="ts">
  import { Search, MapPin, SlidersHorizontal } from "lucide-svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import { limits } from "$lib/stores/limits";

  let query = "";
  let distance = 10;
  $: canSearch = limits.checkSearch($limits.searches);

  function handleSearch() {
    if (!canSearch) return; // Show limit message
    limits.incrementSearch();
    // Implement search logic here
  }
</script>

<div class="h-full w-full flex flex-col p-4 pt-8">
  <h1 class="text-2xl font-bold mb-6 text-white px-2">Discover</h1>

  <div class="space-y-6 flex-1 overflow-y-auto pb-24 px-2">
    <!-- Search Bar -->
    <div class="flex gap-2">
      <div class="relative flex-1">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by interest (e.g. 'Coffee')"
          class="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-neutral-600"
          bind:value={query}
          on:keydown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      <Button size="icon" variant="secondary">
        <SlidersHorizontal size={18} />
      </Button>
    </div>

    {#if !canSearch}
      <div
        class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
      >
        You've reached your daily search limit (5/5).
      </div>
    {/if}

    <!-- Distance Slider -->
    <div class="space-y-3">
      <div class="flex justify-between text-sm">
        <span class="text-neutral-400">Distance</span>
        <span class="font-bold">{distance} km</span>
      </div>
      <input
        type="range"
        min="1"
        max="100"
        bind:value={distance}
        class="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
      />
    </div>

    <!-- Mock Map/Grid -->
    <div class="grid grid-cols-2 gap-3 mt-4">
      <!-- Mock profiles found -->
      {#each Array(4) as _}
        <div
          class="aspect-[3/4] bg-neutral-900 rounded-2xl animate-pulse"
        ></div>
      {/each}
    </div>
  </div>

  <Navbar />
</div>
