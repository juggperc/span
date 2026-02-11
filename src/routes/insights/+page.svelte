<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import { behavior } from "$lib/stores/behavior";
  import { insights } from "$lib/stores/insights";
  import { BarChart3, Eye, ChevronRight } from "lucide-svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let visible = false;
  let currentInsight: ReturnType<typeof insights.getCurrentWeek> = undefined;

  onMount(() => {
    // Generate insights for this week if not already done
    insights.generateForWeek($behavior);

    // Get current week's insight
    currentInsight = insights.getCurrentWeek($insights);

    setTimeout(() => {
      visible = true;
    }, 50);
  });

  function dismiss() {
    if (currentInsight) {
      insights.dismiss(currentInsight.week);
      currentInsight = undefined;
    }
  }

  // Get session stats
  $: stats = behavior.getSessionStats($behavior);
</script>

<div class="h-full w-full flex flex-col">
  <div class="flex-1 overflow-y-auto pb-24">
    <!-- Header -->
    <div class="px-6 pt-12 pb-8">
      <div class="space-y-3" class:animate-fade-in={visible}>
        <div class="flex items-center gap-2">
          <Eye size={16} class="text-neutral-500" />
          <span
            class="text-xs font-medium text-neutral-500 uppercase tracking-widest"
            >Pattern Mirror</span
          >
        </div>
        <h1 class="text-2xl font-bold text-white leading-tight tracking-tight">
          See yourself clearly.
        </h1>
        <p class="text-sm text-neutral-500 leading-relaxed max-w-[300px]">
          Honest observations about how you swipe. No judgment — just a mirror.
        </p>
      </div>
    </div>

    <!-- Divider -->
    <div
      class="mx-6 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
    ></div>

    <!-- This Week's Stats -->
    <section class="px-6 py-8 space-y-5">
      <h2 class="text-xs font-bold text-neutral-500 uppercase tracking-widest">
        This session
      </h2>

      <div class="grid grid-cols-2 gap-3">
        <div
          class="p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/40"
          style="animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) 100ms both; {visible
            ? ''
            : 'opacity: 0;'}"
        >
          <p class="text-2xl font-bold text-white">{stats.total}</p>
          <p class="text-[11px] text-neutral-500 mt-1">profiles viewed</p>
        </div>
        <div
          class="p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/40"
          style="animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) 180ms both; {visible
            ? ''
            : 'opacity: 0;'}"
        >
          <p class="text-2xl font-bold text-white">
            {stats.avgDwell > 0
              ? (stats.avgDwell / 1000).toFixed(1) + "s"
              : "—"}
          </p>
          <p class="text-[11px] text-neutral-500 mt-1">avg. attention</p>
        </div>
        <div
          class="p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/40"
          style="animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) 260ms both; {visible
            ? ''
            : 'opacity: 0;'}"
        >
          <p class="text-2xl font-bold text-white">{stats.likes}</p>
          <p class="text-[11px] text-neutral-500 mt-1">likes sent</p>
        </div>
        <div
          class="p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/40"
          style="animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) 340ms both; {visible
            ? ''
            : 'opacity: 0;'}"
        >
          <p class="text-2xl font-bold text-white">{stats.drawerOpens}</p>
          <p class="text-[11px] text-neutral-500 mt-1">drawers opened</p>
        </div>
      </div>
    </section>

    <!-- Divider -->
    <div
      class="mx-6 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
    ></div>

    <!-- Weekly Insights -->
    <section class="px-6 py-8 space-y-5">
      <div class="flex items-center gap-2">
        <BarChart3 size={14} class="text-neutral-500" />
        <h2
          class="text-xs font-bold text-neutral-500 uppercase tracking-widest"
        >
          Weekly insight
        </h2>
      </div>

      {#if currentInsight}
        <div
          class="space-y-3"
          style="animation: fade-in 0.4s ease 200ms both; {visible
            ? ''
            : 'opacity: 0;'}"
        >
          {#each currentInsight.insights as insight, i}
            <div
              class="p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/40"
              style="animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) {400 +
                i * 80}ms both;"
            >
              <p class="text-sm text-neutral-300 leading-relaxed">{insight}</p>
            </div>
          {/each}

          <button
            class="w-full py-3 rounded-xl border border-neutral-800 text-neutral-500 text-xs font-medium hover:bg-neutral-900/60 transition-all active:scale-[0.98]"
            on:click={dismiss}
          >
            Acknowledged
          </button>
        </div>
      {:else}
        <div
          class="p-6 rounded-2xl border border-neutral-800/40 bg-neutral-900/20 text-center"
        >
          <p class="text-sm text-neutral-500">
            Your weekly mirror will appear here on Sunday evening.
          </p>
          <p class="text-xs text-neutral-600 mt-2">
            Keep swiping with intention — the pattern will reveal itself.
          </p>
        </div>
      {/if}
    </section>

    <!-- Philosophy note -->
    <div class="px-6 pb-8">
      <div
        class="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/30"
      >
        <p class="text-[11px] text-neutral-600 leading-relaxed italic">
          "You think you are becoming aware, while in reality you are just being
          programmed to think that." — This mirror exists to interrupt that
          process.
        </p>
      </div>
    </div>
  </div>

  <Navbar />
</div>
