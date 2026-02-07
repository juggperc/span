<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { elasticOut } from "svelte/easing";
  import { X, Heart, MapPin, Search } from "lucide-svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Tag from "$lib/components/ui/Tag.svelte";
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import { matches } from "$lib/stores/matches";
  import { limits } from "$lib/stores/limits";

  let activeIndex = 0;
  let x = 0;
  let y = 0;
  let isDragging = false;
  let innerWidth: number;
  let container: HTMLElement;

  $: currentProfile = $matches[activeIndex];
  $: canSwipe = limits.checkSwipe($limits.swipes);
  $: canLike = limits.checkLike($limits.likesSent);

  function handleStart(e: MouseEvent | TouchEvent) {
    if (!canSwipe) return;
    isDragging = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    x = 0;
    y = 0;
    // logic to track start position if needed, but relative movement is usually calculated on move
    // simplifying: we need startX to calc delta
    (e.target as HTMLElement).setAttribute("data-start-x", clientX.toString());
    (e.target as HTMLElement).setAttribute("data-start-y", clientY.toString());
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const startX = parseFloat(
      (e.target as HTMLElement).getAttribute("data-start-x") || "0",
    );
    const startY = parseFloat(
      (e.target as HTMLElement).getAttribute("data-start-y") || "0",
    );

    x = clientX - startX;
    y = clientY - startY;
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;

    const threshold = 100;
    if (x > threshold) {
      handleLike();
    } else if (x < -threshold) {
      handlePass();
    } else {
      x = 0;
      y = 0;
    }
  }

  function handleLike() {
    if (!canSwipe || !canLike) {
      x = 0;
      y = 0;
      return; // Show limit modal/toast ideally
    }
    limits.incrementSwipe();
    limits.incrementLike();
    nextProfile();
  }

  function handlePass() {
    if (!canSwipe) {
      x = 0;
      y = 0;
      return;
    }
    limits.incrementSwipe();
    nextProfile();
  }

  function nextProfile() {
    x = 0;
    y = 0;
    // In reality we would remove the current profile from list or fetch more
    // For demo, just increment index or remove from store
    matches.remove(currentProfile.id);
    // activeIndex remains 0 as the list shifts
  }
</script>

<svelte:window
  bind:innerWidth
  on:mouseup={handleEnd}
  on:touchend={handleEnd}
  on:mousemove={handleMove}
  on:touchmove={handleMove}
/>

<div class="h-full w-full relative flex flex-col p-4">
  <!-- Header -->
  <div class="flex justify-between items-center mb-4 px-2">
    <h1 class="text-2xl font-bold tracking-tighter text-white">span</h1>
    <div class="text-xs font-mono text-neutral-500">
      {$limits.swipes}/20 Swipes
    </div>
  </div>

  <!-- Card Stack -->
  <div
    class="flex-1 relative w-full max-w-[350px] mx-auto perspective-1000 mb-20"
    bind:this={container}
  >
    {#if !canSwipe}
      <div
        class="absolute inset-0 flex items-center justify-center p-6 text-center"
        in:fade
      >
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">You're all out of swipes.</h2>
          <p class="text-neutral-400">
            Come back tomorrow for 20 more profiles selected just for you.
          </p>
        </div>
      </div>
    {:else if currentProfile}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-10"
        style="transform: translate({x}px, {y}px) rotate({x *
          0.05}deg); transition: {isDragging
          ? 'none'
          : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'}"
        on:mousedown={handleStart}
        on:touchstart|nonpassive={handleStart}
      >
        <Card class="bg-neutral-900 border-neutral-800">
          <img
            src={currentProfile.imageUrl}
            alt={currentProfile.name}
            class="w-full h-[65%] object-cover pointer-events-none"
          />
          <div class="p-5 flex flex-col gap-3 pointer-events-none">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-bold flex items-center gap-2">
                  {currentProfile.name}, {currentProfile.age}
                </h2>
                <p
                  class="text-neutral-400 text-sm flex items-center gap-1 mt-1"
                >
                  <MapPin size={14} />
                  {currentProfile.location} • {currentProfile.distance}km
                </p>
              </div>
            </div>

            <p class="text-sm text-neutral-300 line-clamp-2">
              {currentProfile.bio}
            </p>

            <div class="flex flex-wrap gap-2 mt-1">
              {#each currentProfile.tags as tag}
                <Tag>{tag}</Tag>
              {/each}
            </div>
          </div>
        </Card>

        <!-- Swipe Indicators -->
        {#if x > 50}
          <div
            class="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-2 text-green-500 font-bold text-2xl -rotate-12 bg-black/20 backdrop-blur-sm"
            in:fade
          >
            LIKE
          </div>
        {:else if x < -50}
          <div
            class="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-2 text-red-500 font-bold text-2xl rotate-12 bg-black/20 backdrop-blur-sm"
            in:fade
          >
            NOPE
          </div>
        {/if}
      </div>

      <!-- Controls -->
      <div
        class="absolute bottom-4 left-0 right-0 flex justify-center gap-6 z-20 pointer-events-auto"
      >
        <button
          class="h-14 w-14 rounded-full bg-neutral-900 border border-neutral-800 text-red-500 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
          on:click={handlePass}
        >
          <X size={24} />
        </button>
        <button
          class="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
          on:click={handleLike}
          disabled={!canLike}
        >
          <Heart size={24} fill="currentColor" />
        </button>
      </div>
    {:else}
      <div
        class="absolute inset-0 flex items-center justify-center p-6 text-center"
        in:fade
      >
        <div class="space-y-4">
          <div
            class="h-20 w-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto animate-pulse"
          >
            <Search size={32} class="text-neutral-600" />
          </div>
          <h2 class="text-xl font-bold">No more profiles</h2>
          <p class="text-neutral-400 text-sm">
            Expand your search/location settings to see more people.
          </p>
        </div>
      </div>
    {/if}
  </div>

  <Navbar />
</div>

<style>
  .perspective-1000 {
    perspective: 1000px;
  }
</style>
