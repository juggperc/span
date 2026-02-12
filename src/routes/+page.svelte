<script lang="ts">
  import {
    X,
    Heart,
    MapPin,
    Search,
    Info,
    Lock,
    Target,
    Sparkles,
    MessageCircle,
  } from "lucide-svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Tag from "$lib/components/ui/Tag.svelte";
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { matches } from "$lib/stores/matches";
  import { limits, MAX_SWIPES, MAX_LIKES_SENT } from "$lib/stores/limits";
  import { mutual } from "$lib/stores/mutual";
  import { behavior } from "$lib/stores/behavior";
  import { anchor } from "$lib/stores/anchor";
  import { rankProfiles, getResonance, getProfileDepth } from "$lib/algorithm";
  import type { UserPreferences } from "$lib/algorithm";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { user } from "$lib/stores/user";
  import { getUserProfile } from "$lib/appwrite-db";
  import { goto } from "$app/navigation";

  // User preferences (defaults until loaded)
  let userPrefs: UserPreferences = {
    tags: [],
    age: 25,
    maxDistance: 100,
    myersBriggs: "",
    relationshipType: "serious",
    smoker: false,
    usesWeed: false,
    wantsKids: "maybe",
    monogamy: "monogamous",
    gender: "man",
    lookingFor: ["woman"],
  };

  // Gesture state
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

  // v3 feature state
  let dwellStart = 0;
  let anchorInput = "";
  let showAnchorCard = true;
  let showPacingPrompt = false;
  let breathPause = false;

  // Lovey touches
  let showHearts = false;
  let heartKey = 0;

  $: currentProfile = $matches[0];
  $: nextProfile = $matches[1] || null;
  $: canSwipe = limits.checkSwipe($limits.swipes);
  $: canLike = limits.checkLike($limits.likesSent);
  $: swipeProgress = Math.min(Math.abs(offsetX) / 120, 1);
  $: rotation = offsetX * 0.08;
  $: swipeRatio = $limits.swipes / MAX_SWIPES; // 0 → 1 as swipes deplete
  // Background color temperature: warm (amber) → cool (blue) as swipes deplete
  $: bgHue = Math.round(30 + swipeRatio * 190); // 30 (warm) → 220 (cool)
  $: bgOpacity = 0.015 + swipeRatio * 0.02;

  // Resonance for current profile
  $: resonance = currentProfile
    ? getResonance(currentProfile, userPrefs, $behavior)
    : null;

  // Profile depth for current profile
  $: profileDepth = currentProfile ? getProfileDepth(currentProfile) : 0;

  onMount(async () => {
    if ($user) {
      // 1. Load MY profile to get real preferences
      try {
        const myProfile = await getUserProfile($user.$id);
        if (!myProfile) {
          console.log("No profile found, redirecting to onboarding...");
          window.location.href = "/onboarding";
          return;
        }

        if (myProfile) {
          userPrefs = {
            tags: myProfile.tags,
            age: myProfile.age,
            maxDistance: 50, // TODO: Add to schema
            myersBriggs: myProfile.myersBriggs,
            relationshipType: myProfile.relationshipType,
            smoker: myProfile.smoker,
            usesWeed: myProfile.usesWeed,
            wantsKids: myProfile.wantsKids,
            monogamy: myProfile.monogamy,
            gender: myProfile.gender,
            lookingFor: myProfile.lookingFor,
          };
        }
      } catch (e) {
        console.error("Failed to load user profile", e);
      }

      // 2. Load candidates
      await matches.loadFromAppwrite($user.$id);

      // 3. Rank profiles using the loaded preferences
      const ranked = rankProfiles([...$matches], userPrefs, $behavior);
      matches.set(ranked);
    }
    dwellStart = Date.now();

    // Load saved anchor answer
    anchorInput = $anchor.answer;
  });

  function showToast(msg: string) {
    toast = msg;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast = "";
    }, 2400);
  }

  function saveAnchorAnswer() {
    if (anchorInput.trim()) {
      anchor.setAnswer(anchorInput);
      showAnchorCard = false;
      showToast("Answer saved to your profile");
    }
  }

  // breath pause between cards
  function breathTransition(callback: () => void) {
    breathPause = true;
    setTimeout(() => {
      callback();
      breathPause = false;
      dwellStart = Date.now(); // reset dwell for next card
    }, 250);
  }

  // --- Gesture handlers ---
  function handlePointerDown(e: PointerEvent) {
    if (!canSwipe || isExiting || breathPause) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = 0;
    offsetY = 0;
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
      offsetX = 0;
      offsetY = 0;
    }
  }

  function recordBehavior(action: "like" | "pass") {
    if (!currentProfile) return;
    const dwellMs = Date.now() - dwellStart;
    behavior.record({
      profileId: currentProfile.id,
      dwellMs,
      drawerOpened: showDetails,
      action,
      tags: currentProfile.tags,
      timestamp: Date.now(),
    });

    // Check session pacing
    if (behavior.isSwipingTooFast($behavior)) {
      showPacingPrompt = true;
      behavior.resetSessionPacing();
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
    recordBehavior("like");
    limits.incrementSwipe();
    limits.incrementLike();
    if (currentProfile) {
      mutual.addLike(currentProfile);
    }

    // Trigger floating hearts
    showHearts = true;
    heartKey++;
    setTimeout(() => {
      showHearts = false;
    }, 1400);

    animateExit("right");
  }

  function handlePass() {
    if (!canSwipe) {
      showToast(`Daily swipe limit reached (${MAX_SWIPES}/${MAX_SWIPES})`);
      offsetX = 0;
      offsetY = 0;
      return;
    }
    recordBehavior("pass");
    limits.incrementSwipe();
    animateExit("left");
  }

  function animateExit(direction: "left" | "right") {
    isExiting = true;
    exitDirection = direction;
    offsetX = direction === "right" ? 500 : -500;
    offsetY = -40;

    setTimeout(() => {
      breathTransition(() => {
        if (currentProfile) {
          matches.remove(currentProfile.id);
        }
        offsetX = 0;
        offsetY = 0;
        isExiting = false;
        showDetails = false;
      });
    }, 320);
  }

  function toggleDetails() {
    showDetails = !showDetails;
  }

  function dismissPacing() {
    showPacingPrompt = false;
  }
</script>

<div
  class="h-full w-full relative flex flex-col p-5 pt-6 select-none transition-colors duration-1000"
  style="background: linear-gradient(180deg, hsla({bgHue}, 30%, 8%, {bgOpacity}) 0%, transparent 60%);"
>
  <!-- Floating hearts on like -->
  {#if showHearts}
    {#key heartKey}
      <div class="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {#each [0, 1, 2, 3, 4] as i}
          <div
            class="absolute animate-float-heart"
            style="
              left: {30 + i * 10}%;
              bottom: 30%;
              animation-delay: {i * 100}ms;
              font-size: {14 + i * 4}px;
            "
          >
            ❤️
          </div>
        {/each}
      </div>
    {/key}
  {/if}

  <!-- Header -->
  <div class="flex justify-between items-center mb-4 px-1">
    <div class="flex items-center gap-1.5">
      <Logo size="sm" />
    </div>
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

  <!-- Session Pacing Prompt -->
  {#if showPacingPrompt}
    <div
      class="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
      transition:fade={{ duration: 300 }}
    >
      <div class="text-center space-y-5 max-w-[280px] animate-fade-in">
        <div
          class="h-16 w-16 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center mx-auto"
        >
          <Sparkles size={24} class="text-neutral-400" />
        </div>
        <h2 class="text-lg font-semibold text-white">Take a breath.</h2>
        <p class="text-sm text-neutral-400 leading-relaxed">
          These are real people. Slow down — the ones who matter will still be
          here.
        </p>
        <button
          class="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-95"
          on:click={dismissPacing}
        >
          I'll slow down
        </button>
      </div>
    </div>
  {/if}

  <!-- Card Stack -->
  <div
    class="flex-1 relative w-full max-w-[350px] mx-auto"
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
      <!-- Anchor Question Card (above the stack) -->
      {#if showAnchorCard && !$anchor.answer}
        <div
          class="mb-3 p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-sm animate-fade-in"
          transition:fade={{ duration: 200 }}
        >
          <div class="flex items-start gap-2.5 mb-3">
            <div
              class="h-7 w-7 rounded-lg bg-neutral-800 border border-neutral-700/50 flex items-center justify-center shrink-0"
            >
              <MessageCircle size={13} class="text-neutral-400" />
            </div>
            <p class="text-xs text-neutral-300 leading-relaxed pt-0.5">
              {$anchor.currentQuestion}
            </p>
          </div>
          <div class="flex gap-2">
            <input
              type="text"
              placeholder="Your answer…"
              class="flex-1 bg-neutral-800/50 border border-neutral-700/40 rounded-xl py-2 px-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              bind:value={anchorInput}
              on:keydown={(e) => e.key === "Enter" && saveAnchorAnswer()}
            />
            <button
              class="px-3 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-30"
              on:click={saveAnchorAnswer}
              disabled={!anchorInput.trim()}
            >
              Save
            </button>
          </div>
        </div>
      {/if}

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

      <!-- Breath pause overlay -->
      {#if breathPause}
        <div
          class="absolute inset-0 z-[25] rounded-2xl"
          style="background: radial-gradient(circle, transparent 30%, rgba(0,0,0,0.3) 100%); backdrop-filter: blur(2px);"
          transition:fade={{ duration: 200 }}
        ></div>
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
          <div class="relative">
            <img
              src={currentProfile.imageUrl}
              alt={currentProfile.name}
              class="w-full h-[60%] object-cover pointer-events-none"
            />
            <!-- Profile Depth Indicator -->
            <div class="absolute top-3 right-3 flex gap-1 pointer-events-none">
              {#each Array(3) as _, i}
                <div
                  class="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                  class:bg-white={i < profileDepth}
                  class:bg-neutral-700={i >= profileDepth}
                ></div>
              {/each}
            </div>
          </div>

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

            <!-- Anchor Answer (if they have one) -->
            {#if currentProfile.anchorAnswer}
              <div
                class="px-3 py-2 rounded-xl bg-neutral-800/40 border border-neutral-700/30"
              >
                <p
                  class="text-[11px] text-neutral-500 mb-1 flex items-center gap-1"
                >
                  <MessageCircle size={10} /> Anchor
                </p>
                <p
                  class="text-xs text-neutral-300 leading-relaxed line-clamp-2 italic"
                >
                  "{currentProfile.anchorAnswer}"
                </p>
              </div>
            {/if}

            <div class="flex flex-wrap gap-1.5">
              {#each currentProfile.tags.slice(0, 4) as tag}
                <Tag>{tag}</Tag>
              {/each}
              <Tag>{currentProfile.myersBriggs}</Tag>
            </div>
          </div>
        </Card>

        <!-- Swipe Indicators -->
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
    {:else}
      <!-- No profiles available -->
      <div
        class="absolute inset-0 flex items-center justify-center p-6 text-center animate-fade-in"
      >
        <div class="space-y-4">
          <div
            class="h-20 w-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto"
          >
            <Search size={32} class="text-neutral-600" />
          </div>
          <h2 class="text-xl font-bold">No profiles yet.</h2>
          <p class="text-neutral-400 text-sm leading-relaxed max-w-[260px]">
            We're finding people for you. Check back soon.
          </p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Controls (outside card stack to prevent clipping) -->
  {#if canSwipe && currentProfile}
    <div class="flex justify-center items-center gap-5 py-3 mb-16">
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
  {/if}

  <!-- Details Drawer (outside card stack to prevent clipping) -->
  {#if showDetails && currentProfile}
    <div
      class="fixed inset-x-0 bottom-24 z-30 mx-4 max-w-[350px] mx-auto bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl p-5 shadow-2xl animate-slide-up"
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

        <!-- Resonance Score -->
        {#if resonance}
          <div
            class="rounded-xl border border-neutral-800 bg-neutral-800/20 p-3 space-y-2"
          >
            <div class="flex items-center gap-1.5">
              <Target size={12} class="text-neutral-500" />
              <span
                class="text-[10px] font-bold text-neutral-500 uppercase tracking-wider"
                >Resonance</span
              >
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                class="text-[10px] px-2 py-0.5 rounded-full border {resonance.intentLabel ===
                'aligned'
                  ? 'border-emerald-800 bg-emerald-950 text-emerald-400'
                  : resonance.intentLabel === 'compatible'
                    ? 'border-yellow-800 bg-yellow-950 text-yellow-400'
                    : 'border-neutral-700 bg-neutral-800 text-neutral-500'}"
              >
                Intent: {resonance.intentLabel}
              </span>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-800 text-neutral-400"
              >
                Values: {resonance.valuesPercent}%
              </span>
              {#if resonance.sharedTags.length > 0}
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-800 text-neutral-400"
                >
                  {resonance.sharedTags.length} shared
                  {resonance.sharedTags.length === 1 ? "interest" : "interests"}
                </span>
              {/if}
              {#if resonance.mbtiCompat}
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full border border-purple-800 bg-purple-950 text-purple-400"
                >
                  MBTI match
                </span>
              {/if}
            </div>
          </div>
        {/if}

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

  <Navbar />
</div>
