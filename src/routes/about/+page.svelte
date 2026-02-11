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
    Brain,
    Layers,
  } from "lucide-svelte";
  import { onMount } from "svelte";

  let visible = false;

  onMount(() => {
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
      body: "Profiles are ranked by compatibility, not popularity. Intent, values, shared interests, and personality type all factor in — never follower counts or likes received.",
    },
    {
      icon: Eye,
      title: "5 daily searches",
      body: "Discovery is intentional. You can't endlessly browse. Five searches per day forces you to know what you're looking for.",
    },
  ];

  const cogSecPrinciples = [
    {
      icon: Shield,
      title: "Anti-entrainment",
      body: "Most feeds exploit moments of fatigue — late nights, post-conflict spirals — as entry points for narrative implantation. Span's daily limits and breath pauses interrupt this cycle.",
    },
    {
      icon: Brain,
      title: "Your judgement stays yours",
      body: "We never punish perception or psychologize boundaries. When you feel something, we give you a mirror — not a script. The Pattern Mirror shows you how you swipe, not how you should.",
    },
    {
      icon: Eye,
      title: "The algorithm is legible",
      body: "Every profile shows a Resonance Score — why this person appeared in your feed. Intent alignment, values match, shared world. No hidden signals. No dark patterns.",
    },
    {
      icon: Layers,
      title: "Depth over surface",
      body: "Anchor Questions replace empty bios with real reflection. Profile depth indicators reward investment. The system surfaces people who show up with intention.",
    },
  ];

  const algorithmFactors = [
    {
      name: "Intent alignment",
      weight: "20%",
      desc: "Are you both looking for the same thing?",
    },
    {
      name: "Values match",
      weight: "15%",
      desc: "Lifestyle compatibility on things that matter.",
    },
    {
      name: "Shared interests",
      weight: "30%",
      desc: "Tag overlap between your profiles.",
    },
    {
      name: "Age proximity",
      weight: "12%",
      desc: "How close you are in age.",
    },
    {
      name: "Distance",
      weight: "12%",
      desc: "Geographic closeness.",
    },
    {
      name: "MBTI compatibility",
      weight: "6%",
      desc: "Personality type alignment.",
    },
    {
      name: "Profile depth",
      weight: "5%",
      desc: "Effort invested in their profile.",
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
      title: "Answer the Anchor Question",
      body: "It shows up on your card. A thoughtful answer is the difference between someone swiping past and someone stopping to read.",
    },
    {
      num: "05",
      title: "Check your mirror",
      body: "The Pattern Mirror shows you how you swipe. If you're rushing, the app will notice. Use the insight, not the impulse.",
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

    <div
      class="mx-6 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
    ></div>

    <!-- Cognitive Security -->
    <section class="px-6 py-8 space-y-5">
      <h2 class="text-xs font-bold text-neutral-500 uppercase tracking-widest">
        Cognitive security
      </h2>
      <p class="text-xs text-neutral-500 leading-relaxed max-w-[300px]">
        Most apps train you to leave people who love you. The feed dissolves
        your capacity to hold ambiguity, tolerate friction, and sustain
        attention. Span is built to protect that capacity.
      </p>

      {#each cogSecPrinciples as item, i}
        <div
          class="group p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/40 hover:border-neutral-700/60 transition-all duration-300"
          style="animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) {100 +
            i * 80}ms both; {visible ? '' : 'opacity: 0;'}"
        >
          <div class="flex items-start gap-3">
            <div
              class="h-9 w-9 rounded-xl bg-neutral-800 border border-neutral-700/50 flex items-center justify-center shrink-0"
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

    <div
      class="mx-6 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
    ></div>

    <!-- How the algorithm works -->
    <section class="px-6 py-8 space-y-5">
      <h2 class="text-xs font-bold text-neutral-500 uppercase tracking-widest">
        How our algorithm works
      </h2>
      <p class="text-xs text-neutral-500 leading-relaxed max-w-[300px]">
        Full transparency. Here's exactly what goes into ranking profiles in
        your feed — and what doesn't. We never rank by popularity, follower
        count, or how many likes someone received.
      </p>

      <div class="space-y-2">
        {#each algorithmFactors as factor, i}
          <div
            class="flex items-center gap-3 py-2"
            style="animation: fade-in 0.3s ease {i * 60}ms both; {visible
              ? ''
              : 'opacity: 0;'}"
          >
            <span
              class="text-[11px] font-mono text-neutral-600 w-9 text-right shrink-0"
              >{factor.weight}</span
            >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <div
                  class="h-1.5 rounded-full bg-white/20"
                  style="width: {factor.weight}; min-width: 8px;"
                ></div>
                <span class="text-xs font-semibold text-neutral-200"
                  >{factor.name}</span
                >
              </div>
              <p class="text-[11px] text-neutral-500 mt-0.5 ml-0">
                {factor.desc}
              </p>
            </div>
          </div>
        {/each}
      </div>

      <div
        class="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/40"
      >
        <p class="text-[11px] text-neutral-500 leading-relaxed">
          <strong class="text-neutral-400">+ Behavioral learning:</strong> As you
          swipe, the algorithm learns your implicit preferences from dwell time,
          drawer opens, and pass speed. This ramps up to 20% of scoring weight over
          time.
        </p>
      </div>
    </section>

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
