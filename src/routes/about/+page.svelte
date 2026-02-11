<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import {
    Sparkles,
    Heart,
    Lock,
    Clock,
    Eye,
    Shield,
    Target,
    ArrowRight,
  } from "lucide-svelte";
  import { onMount } from "svelte";

  let visible = false;

  onMount(() => {
    // Stagger animation trigger
    setTimeout(() => {
      visible = true;
    }, 50);
  });

  const principles = [
    {
      icon: Clock,
      title: "20 swipes a day",
      body: "Every other app gives you infinite scrolling. Span gives you 20. Constraints force attention. You actually look at who you're swiping on.",
    },
    {
      icon: Heart,
      title: "5 likes, not 50",
      body: "When likes are scarce, they mean something. You send them to people you genuinely want to meet, not to everyone with a pulse.",
    },
    {
      icon: Lock,
      title: "Mutual Reveal",
      body: "Lifestyle details — smoking, kids, relationship style — stay hidden until you match. This keeps first impressions based on who someone is, not a checklist.",
    },
    {
      icon: Target,
      title: "Algorithmic curation",
      body: "Profiles are ranked by compatibility, not popularity. Shared interests, age proximity, distance, and personality type all factor in.",
    },
    {
      icon: Eye,
      title: "5 daily searches",
      body: "Discovery is intentional. You can't endlessly browse. Five searches per day forces you to know what you're looking for.",
    },
  ];

  const tips = [
    {
      num: "01",
      title: "Write a real bio",
      body: "One sentence about what you actually care about is better than a list of adjectives. Give people something to respond to.",
    },
    {
      num: "02",
      title: "Choose tags that matter",
      body: "Pick interests that genuinely define your lifestyle. The algorithm uses them to find compatible people.",
    },
    {
      num: "03",
      title: "Don't rush your swipes",
      body: "You have 20. Read the bio. Look at the tags. Open the details drawer. A thoughtful swipe is worth 50 fast ones.",
    },
    {
      num: "04",
      title: "Reveal, then message",
      body: "When you match, reveal their lifestyle details first. Use what you learn to send a first message that shows you paid attention.",
    },
    {
      num: "05",
      title: "Come back daily",
      body: "Limits reset every 24 hours. Consistency beats binging. The best connections are built over time, not in one session.",
    },
  ];
</script>

<div class="h-full w-full flex flex-col">
  <div class="flex-1 overflow-y-auto pb-24">
    <!-- Hero -->
    <div class="relative px-6 pt-12 pb-10">
      <div class="space-y-4" class:animate-fade-in={visible}>
        <div class="flex items-center gap-2">
          <Sparkles size={16} class="text-neutral-500" />
          <span
            class="text-xs font-medium text-neutral-500 uppercase tracking-widest"
            >Philosophy</span
          >
        </div>
        <h1 class="text-3xl font-bold text-white leading-tight tracking-tight">
          Dating should<br />reward patience.
        </h1>
        <p class="text-sm text-neutral-400 leading-relaxed max-w-[300px]">
          Span is built on a simple belief: less choice leads to better
          decisions. Every feature is designed to slow you down, make you think,
          and help you connect with people who actually matter.
        </p>
      </div>

      <!-- Decorative line -->
      <div
        class="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
      ></div>
    </div>

    <!-- What makes span different -->
    <section class="px-6 py-8 space-y-5">
      <h2 class="text-xs font-bold text-neutral-500 uppercase tracking-widest">
        What makes span different
      </h2>

      {#each principles as item, i}
        <div
          class="group p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/40 hover:border-neutral-700/60 transition-all duration-300"
          style="animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) {100 +
            i * 80}ms both; {visible ? '' : 'opacity: 0;'}"
        >
          <div class="flex items-start gap-3">
            <div
              class="h-9 w-9 rounded-xl bg-neutral-800 border border-neutral-700/50 flex items-center justify-center shrink-0 group-hover:bg-neutral-750 transition-colors"
            >
              <svelte:component
                this={item.icon}
                size={16}
                class="text-neutral-300"
              />
            </div>
            <div class="space-y-1">
              <h3 class="text-sm font-semibold text-white">{item.title}</h3>
              <p class="text-xs text-neutral-400 leading-relaxed">
                {item.body}
              </p>
            </div>
          </div>
        </div>
      {/each}
    </section>

    <!-- Decorative line -->
    <div
      class="mx-6 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
    ></div>

    <!-- Best practices -->
    <section class="px-6 py-8 space-y-5">
      <h2 class="text-xs font-bold text-neutral-500 uppercase tracking-widest">
        Best practices
      </h2>

      {#each tips as tip, i}
        <div
          class="flex gap-4 items-start"
          style="animation: fade-in 0.3s ease {i * 60}ms both; {visible
            ? ''
            : 'opacity: 0;'}"
        >
          <span
            class="text-[10px] font-mono text-neutral-600 mt-0.5 shrink-0 w-5"
            >{tip.num}</span
          >
          <div class="space-y-1 pb-4 border-b border-neutral-800/40 flex-1">
            <h3 class="text-sm font-semibold text-neutral-200">{tip.title}</h3>
            <p class="text-xs text-neutral-500 leading-relaxed">{tip.body}</p>
          </div>
        </div>
      {/each}
    </section>

    <!-- CTA -->
    <div class="px-6 pb-8">
      <a
        href="/"
        class="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all duration-200 active:scale-95"
      >
        Start swiping <ArrowRight size={16} />
      </a>
    </div>
  </div>

  <Navbar />
</div>
