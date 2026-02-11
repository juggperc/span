<script lang="ts">
  import { Search, MapPin, SlidersHorizontal } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Tag from "$lib/components/ui/Tag.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import { limits, MAX_SEARCHES } from "$lib/stores/limits";
  import { MOCK_PROFILES, type Profile } from "$lib/stores/matches";
  import { filterProfiles } from "$lib/algorithm";
  import { fade } from "svelte/transition";

  let query = "";
  let distance = 25;
  let results: Profile[] = [];
  let hasSearched = false;

  $: canSearch = limits.checkSearch($limits.searches);

  const popularTags = [
    "Coffee",
    "Travel",
    "Fitness",
    "Music",
    "Art",
    "Tech",
    "Cooking",
  ];

  function handleSearch() {
    if (!canSearch) return;
    limits.incrementSearch();
    results = filterProfiles(MOCK_PROFILES, distance, query);
    hasSearched = true;
  }

  function searchByTag(tag: string) {
    query = tag;
    handleSearch();
  }
</script>

<div class="h-full w-full flex flex-col p-4 pt-8">
  <h1 class="text-2xl font-bold mb-5 text-white px-2">Discover</h1>

  <div class="space-y-5 flex-1 overflow-y-auto pb-24 px-2">
    <!-- Search Bar -->
    <div class="flex gap-2">
      <div class="relative flex-1">
        <Search
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
          size={17}
        />
        <input
          type="text"
          placeholder="Search by interest, name, or MBTI..."
          class="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-neutral-600"
          bind:value={query}
          on:keydown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      <Button
        size="icon"
        variant="secondary"
        on:click={handleSearch}
        disabled={!canSearch}
      >
        <SlidersHorizontal size={17} />
      </Button>
    </div>

    <!-- Limit Badge -->
    <div class="flex items-center justify-between text-xs px-1">
      <span class="text-neutral-500"
        >{$limits.searches}/{MAX_SEARCHES} searches used</span
      >
      {#if !canSearch}
        <span class="text-red-400 font-medium">Limit reached</span>
      {/if}
    </div>

    <!-- Quick Tags -->
    <div class="flex flex-wrap gap-2">
      {#each popularTags as tag}
        <Tag interactive on:click={() => searchByTag(tag)}>{tag}</Tag>
      {/each}
    </div>

    <!-- Distance Slider -->
    <div class="space-y-2">
      <div class="flex justify-between text-sm px-1">
        <span class="text-neutral-400">Distance</span>
        <span class="font-bold text-white">{distance} km</span>
      </div>
      <input
        type="range"
        min="1"
        max="100"
        bind:value={distance}
        class="w-full"
      />
    </div>

    <!-- Results -->
    {#if hasSearched}
      <div class="space-y-3" transition:fade={{ duration: 200 }}>
        <p class="text-xs text-neutral-500 px-1">
          {results.length}
          {results.length === 1 ? "profile" : "profiles"} found
        </p>

        {#if results.length > 0}
          <div class="grid grid-cols-2 gap-3">
            {#each results as profile (profile.id)}
              <div class="animate-scale-in">
                <div
                  class="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 group"
                >
                  <img
                    src={profile.imageUrl}
                    alt={profile.name}
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
                  ></div>
                  <div class="absolute bottom-0 left-0 right-0 p-3">
                    <h3 class="text-sm font-bold text-white">
                      {profile.name}, {profile.age}
                    </h3>
                    <p
                      class="text-[11px] text-neutral-300 flex items-center gap-1 mt-0.5"
                    >
                      <MapPin size={10} />
                      {profile.distance}km
                    </p>
                    <div class="flex gap-1 mt-1.5 flex-wrap">
                      {#each profile.tags.slice(0, 2) as tag}
                        <span
                          class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-neutral-300"
                          >{tag}</span
                        >
                      {/each}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-10 animate-fade-in">
            <p class="text-neutral-500 text-sm">
              No profiles match your search.
            </p>
            <p class="text-neutral-600 text-xs mt-1">
              Try different tags or increase distance.
            </p>
          </div>
        {/if}
      </div>
    {:else}
      <!-- Placeholder Grid -->
      <div class="grid grid-cols-2 gap-3 mt-2">
        {#each Array(4) as _, i}
          <div
            class="aspect-[3/4] bg-neutral-900 rounded-2xl border border-neutral-800 animate-pulse"
            style="animation-delay: {i * 100}ms;"
          ></div>
        {/each}
      </div>
    {/if}
  </div>

  <Navbar />
</div>
