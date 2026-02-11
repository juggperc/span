<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import Tag from "$lib/components/ui/Tag.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { MessageCircle, Lock, Unlock, MapPin, Sparkles } from "lucide-svelte";
  import { mutual, type MatchRecord } from "$lib/stores/mutual";
  import { fade } from "svelte/transition";

  $: mutualMatches = mutual.getMutualMatches($mutual);
  $: likedOnly = $mutual.filter((r) => !r.mutualMatch);

  let selectedMatch: MatchRecord | null = null;

  function openMatch(record: MatchRecord) {
    selectedMatch = record;
  }

  function closeMatch() {
    selectedMatch = null;
  }

  function handleReveal(profileId: string) {
    mutual.reveal(profileId);
    // Update selectedMatch to reflect reveal
    selectedMatch = $mutual.find((r) => r.profile.id === profileId) || null;
  }
</script>

<div class="h-full w-full flex flex-col p-4 pt-8">
  <h1 class="text-2xl font-bold mb-5 text-white px-2">Messages</h1>

  <div class="flex-1 overflow-y-auto pb-24 px-2 space-y-6">
    {#if mutualMatches.length > 0}
      <!-- Mutual matches section -->
      <section class="space-y-3 animate-fade-in">
        <h2
          class="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5"
        >
          <Sparkles size={12} />
          Mutual Matches
        </h2>
        {#each mutualMatches as record (record.profile.id)}
          <button
            class="w-full flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 text-left group"
            on:click={() => openMatch(record)}
          >
            <div class="relative">
              <img
                src={record.profile.imageUrl}
                alt={record.profile.name}
                class="h-14 w-14 rounded-full object-cover border-2 border-emerald-500/30"
              />
              <div
                class="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-2 border-neutral-900 animate-pulse-ring"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-white">
                {record.profile.name}, {record.profile.age}
              </h3>
              <p class="text-xs text-neutral-400 truncate">
                {record.profile.bio}
              </p>
            </div>
            <div class="flex items-center">
              {#if record.revealed}
                <Unlock size={14} class="text-emerald-400" />
              {:else}
                <Lock
                  size={14}
                  class="text-neutral-500 group-hover:text-neutral-300 transition-colors"
                />
              {/if}
            </div>
          </button>
        {/each}
      </section>
    {/if}

    {#if likedOnly.length > 0}
      <!-- Pending likes section -->
      <section
        class="space-y-3 animate-fade-in"
        style="animation-delay: 100ms;"
      >
        <h2 class="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Liked
        </h2>
        {#each likedOnly as record (record.profile.id)}
          <div
            class="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/50"
          >
            <img
              src={record.profile.imageUrl}
              alt={record.profile.name}
              class="h-12 w-12 rounded-full object-cover opacity-60 grayscale"
            />
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-neutral-400">
                {record.profile.name}, {record.profile.age}
              </h3>
              <p class="text-xs text-neutral-600">
                Waiting for them to like you back
              </p>
            </div>
          </div>
        {/each}
      </section>
    {/if}

    {#if $mutual.length === 0}
      <div class="flex-1 flex items-center justify-center min-h-[400px]">
        <div class="text-center space-y-4 animate-fade-in">
          <div
            class="h-20 w-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto"
          >
            <MessageCircle size={32} class="text-neutral-600" />
          </div>
          <h2 class="text-lg font-semibold text-neutral-300">
            No messages yet
          </h2>
          <p
            class="text-sm text-neutral-500 max-w-[240px] mx-auto leading-relaxed"
          >
            Like profiles on the For You page. Mutual matches appear here.
          </p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Match Detail Overlay -->
  {#if selectedMatch}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center"
      on:click={closeMatch}
      transition:fade={{ duration: 150 }}
    >
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="w-full max-w-md bg-neutral-900 border-t border-neutral-800 rounded-t-3xl p-6 pb-10 animate-slide-up"
        on:click|stopPropagation
      >
        <!-- Profile header -->
        <div class="flex items-center gap-4 mb-5">
          <img
            src={selectedMatch.profile.imageUrl}
            alt={selectedMatch.profile.name}
            class="h-16 w-16 rounded-full object-cover border-2 border-emerald-500/30"
          />
          <div>
            <h2 class="text-xl font-bold text-white">
              {selectedMatch.profile.name}, {selectedMatch.profile.age}
            </h2>
            <p class="text-sm text-neutral-400 flex items-center gap-1">
              <MapPin size={12} />
              {selectedMatch.profile.location} &middot; {selectedMatch.profile
                .distance}km
            </p>
          </div>
        </div>

        <!-- Bio -->
        <p class="text-sm text-neutral-300 leading-relaxed mb-4">
          {selectedMatch.profile.bio}
        </p>

        <!-- Tags -->
        <div class="flex flex-wrap gap-1.5 mb-5">
          {#each selectedMatch.profile.tags as tag}
            <Tag>{tag}</Tag>
          {/each}
          <Tag>{selectedMatch.profile.myersBriggs}</Tag>
        </div>

        <!-- Lifestyle details — revealed or locked -->
        {#if selectedMatch.revealed}
          <div class="space-y-2 animate-scale-in">
            <h3
              class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Unlock size={11} /> Revealed Details
            </h3>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div
                class="flex justify-between py-2 px-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50"
              >
                <span class="text-neutral-400">Smoker</span>
                <span class="text-white font-medium"
                  >{selectedMatch.profile.smoker ? "Yes" : "No"}</span
                >
              </div>
              <div
                class="flex justify-between py-2 px-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50"
              >
                <span class="text-neutral-400">420</span>
                <span class="text-white font-medium"
                  >{selectedMatch.profile.usesWeed ? "Yes" : "No"}</span
                >
              </div>
              <div
                class="flex justify-between py-2 px-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50"
              >
                <span class="text-neutral-400">Kids</span>
                <span class="text-white font-medium capitalize"
                  >{selectedMatch.profile.wantsKids}</span
                >
              </div>
              <div
                class="flex justify-between py-2 px-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50"
              >
                <span class="text-neutral-400">Looking for</span>
                <span class="text-white font-medium capitalize"
                  >{selectedMatch.profile.relationshipType}</span
                >
              </div>
              <div
                class="col-span-2 flex justify-between py-2 px-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50"
              >
                <span class="text-neutral-400">Relationship style</span>
                <span class="text-white font-medium capitalize"
                  >{selectedMatch.profile.monogamy}</span
                >
              </div>
            </div>
          </div>
        {:else}
          <div class="space-y-3">
            <div
              class="relative rounded-xl border border-neutral-800 bg-neutral-800/30 p-5 overflow-hidden"
            >
              <div
                class="absolute inset-0 backdrop-blur-[6px] bg-neutral-900/60 z-10 flex flex-col items-center justify-center gap-2"
              >
                <Lock size={20} class="text-neutral-400" />
                <p class="text-xs text-neutral-400 font-medium">
                  Lifestyle details are hidden
                </p>
              </div>
              <div
                class="grid grid-cols-2 gap-2 text-xs opacity-20 select-none"
                aria-hidden="true"
              >
                <div class="py-2 px-3 rounded-xl bg-neutral-800/50">
                  <span class="text-neutral-500">---</span>
                </div>
                <div class="py-2 px-3 rounded-xl bg-neutral-800/50">
                  <span class="text-neutral-500">---</span>
                </div>
                <div class="py-2 px-3 rounded-xl bg-neutral-800/50">
                  <span class="text-neutral-500">---</span>
                </div>
                <div class="py-2 px-3 rounded-xl bg-neutral-800/50">
                  <span class="text-neutral-500">---</span>
                </div>
              </div>
            </div>
            <Button
              class="w-full"
              on:click={() => handleReveal(selectedMatch?.profile.id || "")}
            >
              <Unlock size={14} class="mr-2" /> Reveal Details
            </Button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <Navbar />
</div>
