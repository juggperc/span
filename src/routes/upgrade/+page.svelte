<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import {
    Heart,
    Crown,
    Sparkles,
    Eye,
    Infinity,
    Shield,
    Check,
    ArrowLeft,
  } from "lucide-svelte";
  import {
    subscription,
    isPremium,
    PREMIUM_PRICE,
    PREMIUM_PERIOD,
  } from "$lib/stores/subscription";

  let purchasing = false;

  async function handleUpgrade() {
    purchasing = true;
    // Simulate Stripe checkout delay
    await new Promise((r) => setTimeout(r, 1500));
    subscription.mockPurchase();
    purchasing = false;
  }

  function handleCancel() {
    subscription.cancel();
  }

  const features = [
    {
      icon: Infinity,
      title: "Unlimited Swipes",
      desc: "Remove the 20-swipe daily cap",
    },
    {
      icon: Eye,
      title: "See Who Liked You",
      desc: "View profiles that liked you before matching",
    },
    {
      icon: Sparkles,
      title: "Advanced Resonance",
      desc: "Detailed compatibility breakdowns with percentages",
    },
    {
      icon: Heart,
      title: "Priority Matching",
      desc: "Your profile is shown more to compatible people",
    },
    {
      icon: Shield,
      title: "Read Receipts",
      desc: "Know when your messages are read",
    },
  ];
</script>

<div class="h-full w-full flex flex-col p-4 pt-8 overflow-y-auto pb-24">
  <!-- Back -->
  <a
    href="/"
    class="inline-flex items-center gap-1.5 text-neutral-500 hover:text-white text-sm transition-colors mb-6"
  >
    <ArrowLeft size={16} /> Back
  </a>

  {#if $isPremium}
    <!-- Active subscription -->
    <div
      class="flex-1 flex flex-col items-center justify-center animate-fade-in"
    >
      <div
        class="h-20 w-20 rounded-full gradient-love flex items-center justify-center mb-6 animate-soft-pulse"
      >
        <Crown size={36} class="text-white" />
      </div>

      <h1 class="text-2xl font-bold text-white mb-2">You're Premium</h1>
      <p class="text-neutral-400 text-sm text-center max-w-[260px] mb-8">
        Thank you for supporting intentional connections. All premium features
        are active.
      </p>

      <div class="w-full max-w-sm space-y-3">
        {#each features as feature}
          <div class="flex items-center gap-3 p-3 rounded-xl glass-rose">
            <Check size={16} class="text-pink-400 shrink-0" />
            <span class="text-sm text-white">{feature.title}</span>
          </div>
        {/each}
      </div>

      <button
        class="mt-8 text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        on:click={handleCancel}
      >
        Cancel subscription
      </button>
    </div>
  {:else}
    <!-- Upgrade offer -->
    <div class="flex-1 flex flex-col animate-fade-in">
      <!-- Hero -->
      <div class="text-center mb-8">
        <div
          class="h-16 w-16 rounded-2xl gradient-love flex items-center justify-center mx-auto mb-5 animate-soft-pulse"
        >
          <Crown size={28} class="text-white" />
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">
          span<span class="gradient-love bg-clip-text text-transparent">+</span>
        </h1>
        <p class="text-neutral-400 text-sm max-w-[280px] mx-auto">
          Deeper insights. More connections. Same intentional experience.
        </p>
      </div>

      <!-- Features list -->
      <div class="space-y-3 mb-8">
        {#each features as feature, i}
          <div
            class="flex items-start gap-3.5 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/50 animate-slide-up"
            style="animation-delay: {i * 60}ms;"
          >
            <div
              class="h-9 w-9 rounded-xl glass-rose flex items-center justify-center shrink-0"
            >
              <svelte:component
                this={feature.icon}
                size={16}
                class="text-pink-400"
              />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">{feature.title}</h3>
              <p class="text-xs text-neutral-500 mt-0.5">{feature.desc}</p>
            </div>
          </div>
        {/each}
      </div>

      <!-- Pricing card -->
      <div
        class="rounded-2xl glass-rose p-5 text-center space-y-4 animate-scale-in"
        style="animation-delay: 300ms;"
      >
        <div>
          <span class="text-4xl font-bold text-white">{PREMIUM_PRICE}</span>
          <span class="text-neutral-400 text-sm">{PREMIUM_PERIOD}</span>
        </div>
        <p class="text-xs text-neutral-500">Cancel anytime. No commitments.</p>
        <Button
          class="w-full gradient-love text-white border-0 hover:opacity-90"
          on:click={handleUpgrade}
          disabled={purchasing}
        >
          {#if purchasing}
            <span class="flex items-center gap-2">
              <span
                class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              Processing...
            </span>
          {:else}
            <Heart size={16} class="mr-2" /> Upgrade to span+
          {/if}
        </Button>
      </div>

      <p class="text-[10px] text-neutral-600 text-center mt-4">
        Mock payment for development. Stripe integration coming soon.
      </p>
    </div>
  {/if}

  <Navbar />
</div>
