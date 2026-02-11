<script lang="ts">
  import { X, Heart, MapPin, Search, Info, Lock } from "lucide-svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Tag from "$lib/components/ui/Tag.svelte";
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import { matches, MOCK_PROFILES } from "$lib/stores/matches";
  import { limits, MAX_SWIPES, MAX_LIKES_SENT } from "$lib/stores/limits";
  import { mutual } from "$lib/stores/mutual";
  import { rankProfiles } from "$lib/algorithm";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  // User preferences (would come from profile in production)
  const userPrefs = {
    tags: ["Coding", "Travel", "Coffee", "Design"],
    age: 26,
    maxDistance: 50,
    myersBriggs: "ENTP",
  };

  // Gesture state — stored as component variables, not data-* attributes
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  // Animation state
  let isExiting = false;
  let exitDirection: "left" | "right" = "right";
  let showDetails = false;
  let toast = "";
  let toastTimeout: ReturnType<typeof setTimeout>;

  $: currentProfile = $matches[0];
  $: nextProfile = $matches[1] || null;
  $: canSwipe = limits.checkSwipe($limits.swipes);
  $: canLike = limits.checkLike($limits.likesSent);
  $: swipeProgress = Math.min(Math.abs(offsetX) / 120, 1); // 0–1 opacity for indicators
  $: rotation = offsetX * 0.08; // degrees

  onMount(() => {
    // Rank profiles on mount using the algorithm
    const ranked = rankProfiles([...MOCK_PROFILES], userPrefs);
    matches.set(ranked);
  });

  function showToast(msg: string) {
    toast = msg;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast = "";
    }, 2400);
  }

  // --- Gesture handlers ---
  function handlePointerDown(e: PointerEvent) {
    if (!canSwipe || isExiting) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = 0;
    offsetY = 0;
    // Capture pointer so we get events even if cursor leaves the element
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging || isExiting) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const threshold = 100;
    if (offsetX > threshold) {
      handleLike();
    } else if (offsetX < -threshold) {
      handlePass();
    } else {
      // Snap back with spring
      offsetX = 0;
      offsetY = 0;
    }
  }

  function handleLike() {
    if (!canSwipe) {
      showToast(`Daily swipe limit reached (${MAX_SWIPES}/${MAX_SWIPES})`);
      offsetX = 0;
      offsetY = 0;
      return;
    }
    if (!canLike) {
      showToast(
        `Daily like limit reached (${MAX_LIKES_SENT}/${MAX_LIKES_SENT})`,
      );
      offsetX = 0;
      offsetY = 0;
      return;
    }
    limits.incrementSwipe();
    limits.incrementLike();
    if (currentProfile) {
      mutual.addLike(currentProfile);
    }
    animateExit("right");
  }

  function handlePass() {
    if (!canSwipe) {
      showToast(`Daily swipe limit reached (${MAX_SWIPES}/${MAX_SWIPES})`);
      offsetX = 0;
      offsetY = 0;
      return;
    }
    limits.incrementSwipe();
    animateExit("left");
  }

  function animateExit(direction: "left" | "right") {
    isExiting = true;
    exitDirection = direction;
    offsetX = direction === "right" ? 500 : -500;
    offsetY = -40;

    setTimeout(() => {
      if (currentProfile) {
        matches.remove(currentProfile.id);
      }
      offsetX = 0;
      offsetY = 0;
      isExiting = false;
      showDetails = false;
    }, 320);
  }

  function toggleDetails() {
    showDetails = !showDetails;
  }
</script>

<div class="h-full w-full relative flex flex-col p-4 select-none">
  <!-- Header -->
  <div class="flex justify-between items-center mb-3 px-2">
    <h1 class="text-2xl font-bold tracking-tighter text-white">span</h1>
    <div class="flex items-center gap-3">
      <div class="flex gap-2 text-[11px] font-mono">
        <span class="text-neutral-500">{$limits.swipes}/{MAX_SWIPES}</span>
        <span class="text-neutral-700">|</span>
        <span class="text-neutral-500"
          >{$limits.likesSent}/{MAX_LIKES_SENT}
          <Heart size={10} class="inline -mt-0.5" /></span
        >
      </div>
    </div>
  </div>

  <!-- Toast -->
  {#if toast}
    <div
      class="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-full text-xs text-neutral-300 shadow-lg animate-fade-in"
      transition:fade={{ duration: 200 }}
    >
      {toast}
    </div>
  {/if}

  <!-- Card Stack -->
  <div
    class="flex-1 relative w-full max-w-[350px] mx-auto mb-20"
    style="perspective: 1000px;"
  >
    {#if !canSwipe}
      <div
        class="absolute inset-0 flex items-center justify-center p-6 text-center animate-fade-in"
      >
        <div class="space-y-4">
          <div
            class="h-20 w-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto"
          >
            <Heart size={32} class="text-neutral-600" />
          </div>
          <h2 class="text-xl font-bold">You're all out of swipes.</h2>
          <p class="text-neutral-400 text-sm leading-relaxed max-w-[260px]">
            Come back tomorrow for 20 more profiles selected just for you.
          </p>
        </div>
      </div>
    {:else if currentProfile}
      <!-- Next card (behind) -->
      {#if nextProfile}
        <div
          class="absolute inset-0 w-full h-full z-0 transition-transform duration-300"
          style="transform: scale(0.95) translateY(12px);"
        >
          <Card class="bg-neutral-900 border-neutral-800 opacity-60">
            <img
              src={nextProfile.imageUrl}
              alt={nextProfile.name}
              class="w-full h-[60%] object-cover pointer-events-none"
            />
            <div class="p-5 pointer-events-none">
              <h2 class="text-xl font-bold">
                {nextProfile.name}, {nextProfile.age}
              </h2>
            </div>
          </Card>
        </div>
      {/if}

      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="absolute inset-0 w-full h-full z-10 touch-none"
        class:cursor-grab={!isDragging && !isExiting}
        class:cursor-grabbing={isDragging}
        style="
                    transform: translate({offsetX}px, {offsetY}px) rotate({rotation}deg);
                    transition: {isDragging
          ? 'none'
          : 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease'};
                    opacity: {isExiting ? 0 : 1};
                "
        on:pointerdown={handlePointerDown}
        on:pointermove={handlePointerMove}
        on:pointerup={handlePointerUp}
      >
        <Card class="bg-neutral-900 border-neutral-800">
          <img
            src={currentProfile.imageUrl}
            alt={currentProfile.name}
            class="w-full h-[60%] object-cover pointer-events-none"
          />
          <div class="p-5 flex flex-col gap-2.5 pointer-events-none">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-bold">
                  {currentProfile.name}, {currentProfile.age}
                </h2>
                <p
                  class="text-neutral-400 text-sm flex items-center gap-1 mt-0.5"
                >
                  <MapPin size={13} />
                  {currentProfile.location} &middot; {currentProfile.distance}km
                </p>
              </div>
            </div>

            <p class="text-sm text-neutral-300 line-clamp-2 leading-relaxed">
              {currentProfile.bio}
            </p>

            <div class="flex flex-wrap gap-1.5">
              {#each currentProfile.tags.slice(0, 4) as tag}
                <Tag>{tag}</Tag>
              {/each}
              <Tag>{currentProfile.myersBriggs}</Tag>
            </div>
          </div>
        </Card>

        <!-- Swipe Indicators — opacity scales with drag distance -->
        {#if offsetX > 20}
          <div
            class="absolute top-8 left-8 border-[3px] border-emerald-400 rounded-xl px-4 py-2 text-emerald-400 font-bold text-xl -rotate-12 backdrop-blur-sm"
            style="opacity: {swipeProgress}; background: rgba(16,185,129,0.08);"
          >
            LIKE
          </div>
        {:else if offsetX < -20}
          <div
            class="absolute top-8 right-8 border-[3px] border-red-400 rounded-xl px-4 py-2 text-red-400 font-bold text-xl rotate-12 backdrop-blur-sm"
            style="opacity: {swipeProgress}; background: rgba(239,68,68,0.08);"
          >
            NOPE
          </div>
        {/if}
      </div>

      <!-- Controls -->
      <div
        class="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-5 z-20"
      >
        <button
          class="h-14 w-14 rounded-full bg-neutral-900 border border-neutral-800 text-red-400 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 hover:border-red-500/30 active:scale-90"
          on:click={handlePass}
          disabled={isExiting}
        >
          <X size={24} strokeWidth={2.5} />
        </button>
        <button
          class="h-10 w-10 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-90"
          on:click={toggleDetails}
        >
          <Info size={18} strokeWidth={2} />
        </button>
        <button
          class="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-emerald-500/10 active:scale-90 disabled:opacity-40 disabled:hover:scale-100"
          on:click={handleLike}
          disabled={!canLike || isExiting}
        >
          <Heart size={24} fill="currentColor" />
        </button>
      </div>

      <!-- Details Drawer -->
      {#if showDetails && currentProfile}
        <div
          class="absolute inset-x-0 bottom-20 z-30 mx-2 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl p-5 shadow-2xl animate-slide-up"
          transition:fade={{ duration: 150 }}
        >
          <div class="space-y-3 text-sm">
            <h3 class="font-semibold text-neutral-200">
              About {currentProfile.name}
            </h3>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div
                class="flex justify-between py-1.5 px-2 rounded-lg bg-neutral-800/50"
              >
                <span class="text-neutral-500">MBTI</span>
                <span class="text-white font-medium"
                  >{currentProfile.myersBriggs}</span
                >
              </div>
            </div>

            <!-- Locked lifestyle fields -->
            <div
              class="relative rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 overflow-hidden"
            >
              <div
                class="absolute inset-0 backdrop-blur-[6px] bg-neutral-900/60 z-10 flex flex-col items-center justify-center gap-2"
              >
                <div
                  class="h-10 w-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center"
                >
                  <Lock size={16} class="text-neutral-400" />
                </div>
                <p class="text-[11px] text-neutral-400 font-medium">
                  Match to reveal details
                </p>
              </div>
              <div
                class="grid grid-cols-2 gap-2 text-xs opacity-30 select-none"
                aria-hidden="true"
              >
                <div
                  class="flex justify-between py-1.5 px-2 rounded-lg bg-neutral-800/50"
                >
                  <span class="text-neutral-500">Smoker</span>
                  <span class="text-white">---</span>
                </div>
                <div
                  class="flex justify-between py-1.5 px-2 rounded-lg bg-neutral-800/50"
                >
                  <span class="text-neutral-500">420</span>
                  <span class="text-white">---</span>
                </div>
                <div
                  class="flex justify-between py-1.5 px-2 rounded-lg bg-neutral-800/50"
                >
                  <span class="text-neutral-500">Kids</span>
                  <span class="text-white">---</span>
                </div>
                <div
                  class="flex justify-between py-1.5 px-2 rounded-lg bg-neutral-800/50"
                >
                  <span class="text-neutral-500">Looking for</span>
                  <span class="text-white">---</span>
                </div>
                <div
                  class="flex justify-between py-1.5 px-2 rounded-lg bg-neutral-800/50"
                >
                  <span class="text-neutral-500">Style</span>
                  <span class="text-white">---</span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5 pt-1">
              {#each currentProfile.tags as tag}
                <Tag>{tag}</Tag>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    {:else}
      <div
        class="absolute inset-0 flex items-center justify-center p-6 text-center animate-fade-in"
      >
        <div class="space-y-4">
          <div
            class="h-20 w-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto"
          >
            <Search size={32} class="text-neutral-600" />
          </div>
          <h2 class="text-xl font-bold">No more profiles</h2>
          <p class="text-neutral-400 text-sm leading-relaxed max-w-[260px]">
            Expand your distance or interests to discover more people.
          </p>
        </div>
      </div>
    {/if}
  </div>

  <Navbar />
</div>
