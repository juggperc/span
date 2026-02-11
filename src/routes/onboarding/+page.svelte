<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Tag from "$lib/components/ui/Tag.svelte";
  import {
    Heart,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    MapPin,
    User,
    MessageCircle,
  } from "lucide-svelte";
  import { user } from "$lib/stores/user";
  import { upsertProfile } from "$lib/appwrite-db";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  let step = 0;
  let saving = false;

  // Profile data
  let name = "";
  let age = "";
  let location = "";
  let bio = "";
  let myersBriggs = "";
  let selectedTags: string[] = [];
  let relationshipType: "casual" | "serious" | "friends" | "open" = "serious";
  let monogamy: "monogamous" | "non-monogamous" | "open" = "monogamous";
  let wantsKids: "yes" | "no" | "maybe" = "maybe";

  const AVAILABLE_TAGS = [
    "Travel",
    "Coffee",
    "Cooking",
    "Music",
    "Art",
    "Fitness",
    "Reading",
    "Photography",
    "Hiking",
    "Gaming",
    "Movies",
    "Design",
    "Tech",
    "Yoga",
    "Wine",
    "Dancing",
    "Nature",
    "Coding",
    "Fashion",
    "Foodie",
    "Meditation",
    "Dogs",
    "Cats",
    "Running",
  ];

  const MBTI_TYPES = [
    "INTJ",
    "INTP",
    "ENTJ",
    "ENTP",
    "INFJ",
    "INFP",
    "ENFJ",
    "ENFP",
    "ISTJ",
    "ISFJ",
    "ESTJ",
    "ESFJ",
    "ISTP",
    "ISFP",
    "ESTP",
    "ESFP",
  ];

  $: if (browser && $user?.name) {
    name = name || $user.name;
  }

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter((t) => t !== tag);
    } else if (selectedTags.length < 8) {
      selectedTags = [...selectedTags, tag];
    }
  }

  function next() {
    if (step < 4) step++;
  }

  function prev() {
    if (step > 0) step--;
  }

  $: canProceed =
    step === 0
      ? name.trim().length > 0 && age.trim().length > 0
      : step === 1
        ? selectedTags.length >= 3
        : step === 2
          ? true
          : step === 3
            ? bio.trim().length >= 10
            : true;

  async function finish() {
    if (!$user) return;
    saving = true;
    try {
      await upsertProfile($user.$id, {
        name: name.trim(),
        age: parseInt(age) || 25,
        location: location.trim() || "Unknown",
        bio: bio.trim(),
        tags: selectedTags,
        imageUrl:
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&auto=format&fit=crop&q=60",
        distance: 0,
        myersBriggs: myersBriggs || "INFJ",
        smoker: false,
        usesWeed: false,
        wantsKids,
        relationshipType,
        monogamy,
      });
      // Mark onboarding complete
      if (browser) localStorage.setItem("span_onboarded", "true");
      goto("/");
    } catch (e) {
      console.error("Onboarding save failed:", e);
      // Still navigate — profile can be edited later
      if (browser) localStorage.setItem("span_onboarded", "true");
      goto("/");
    } finally {
      saving = false;
    }
  }

  const steps = [
    { title: "About You", icon: User },
    { title: "Interests", icon: Sparkles },
    { title: "Preferences", icon: Heart },
    { title: "Your Bio", icon: MessageCircle },
    { title: "Ready", icon: ArrowRight },
  ];
</script>

<div class="h-full w-full flex flex-col p-6 pt-10 overflow-y-auto">
  <!-- Steps indicator -->
  <div class="flex items-center gap-1.5 mb-8">
    {#each steps as s, i}
      <div
        class="h-1 flex-1 rounded-full transition-all duration-500 {i <= step
          ? 'bg-white'
          : 'bg-neutral-800'}"
      ></div>
    {/each}
  </div>

  <!-- Step content -->
  <div class="flex-1 flex flex-col animate-fade-in">
    {#if step === 0}
      <!-- Step 1: Basic Info -->
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">Welcome to span</h1>
          <p class="text-sm text-neutral-400">
            Let's set up your profile. This takes about a minute.
          </p>
        </div>

        <Input label="Your name" placeholder="First name" bind:value={name} />
        <Input label="Age" placeholder="25" type="number" bind:value={age} />
        <Input
          label="Location"
          placeholder="City, Country"
          bind:value={location}
        />

        <div>
          <span class="text-xs font-medium text-neutral-400 pl-1 block mb-2"
            >MBTI (optional)</span
          >
          <div class="flex flex-wrap gap-1.5">
            {#each MBTI_TYPES as type}
              <button
                class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 {myersBriggs ===
                type
                  ? 'bg-white text-black'
                  : 'bg-neutral-800/60 text-neutral-500 hover:text-neutral-300 border border-neutral-800'}"
                on:click={() => (myersBriggs = type)}
              >
                {type}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {:else if step === 1}
      <!-- Step 2: Interests -->
      <div class="space-y-5">
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">Your interests</h1>
          <p class="text-sm text-neutral-400">
            Pick at least 3 things you enjoy.
            <span class="text-neutral-600"
              >{selectedTags.length}/8 selected</span
            >
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          {#each AVAILABLE_TAGS as tag}
            <button
              class="px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 {selectedTags.includes(
                tag,
              )
                ? 'bg-white text-black scale-105'
                : 'bg-neutral-800/60 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600'}"
              on:click={() => toggleTag(tag)}
            >
              {tag}
            </button>
          {/each}
        </div>
      </div>
    {:else if step === 2}
      <!-- Step 3: Preferences -->
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">
            What you're seeking
          </h1>
          <p class="text-sm text-neutral-400">
            These help us match you with the right people.
          </p>
        </div>

        <!-- Relationship type -->
        <div>
          <span class="text-xs font-medium text-neutral-400 pl-1 block mb-2"
            >Looking for</span
          >
          <div class="grid grid-cols-2 gap-2">
            {#each [{ value: "serious", label: "Something serious" }, { value: "casual", label: "Casual" }, { value: "friends", label: "Friends first" }, { value: "open", label: "Open to anything" }] as opt}
              <button
                class="p-3 rounded-xl text-sm text-left transition-all duration-200 {relationshipType ===
                opt.value
                  ? 'bg-white text-black font-medium'
                  : 'bg-neutral-800/50 text-neutral-400 border border-neutral-800 hover:border-neutral-600'}"
                on:click={() =>
                  (relationshipType = opt.value as typeof relationshipType)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Monogamy -->
        <div>
          <span class="text-xs font-medium text-neutral-400 pl-1 block mb-2"
            >Relationship style</span
          >
          <div class="grid grid-cols-3 gap-2">
            {#each [{ value: "monogamous", label: "Monogamous" }, { value: "non-monogamous", label: "Non-mono" }, { value: "open", label: "Open" }] as opt}
              <button
                class="p-3 rounded-xl text-xs text-center transition-all duration-200 {monogamy ===
                opt.value
                  ? 'bg-white text-black font-medium'
                  : 'bg-neutral-800/50 text-neutral-400 border border-neutral-800 hover:border-neutral-600'}"
                on:click={() => (monogamy = opt.value as typeof monogamy)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Kids -->
        <div>
          <span class="text-xs font-medium text-neutral-400 pl-1 block mb-2"
            >Want kids?</span
          >
          <div class="grid grid-cols-3 gap-2">
            {#each [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "maybe", label: "Maybe" }] as opt}
              <button
                class="p-3 rounded-xl text-sm text-center transition-all duration-200 {wantsKids ===
                opt.value
                  ? 'bg-white text-black font-medium'
                  : 'bg-neutral-800/50 text-neutral-400 border border-neutral-800 hover:border-neutral-600'}"
                on:click={() => (wantsKids = opt.value as typeof wantsKids)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {:else if step === 3}
      <!-- Step 4: Bio -->
      <div class="space-y-5">
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">Tell your story</h1>
          <p class="text-sm text-neutral-400">
            Write something real. Profiles with thoughtful bios get 3× more
            meaningful matches.
          </p>
        </div>

        <textarea
          bind:value={bio}
          placeholder="What should someone know about you? What matters to you? What are you curious about?"
          class="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-4 px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none h-40 leading-relaxed"
        ></textarea>

        <div class="flex justify-between text-[11px] text-neutral-600 px-1">
          <span>{bio.length} characters</span>
          <span class={bio.length >= 10 ? "text-emerald-500" : ""}
            >{bio.length >= 10 ? "✓ Looks good" : "10+ characters"}</span
          >
        </div>
      </div>
    {:else if step === 4}
      <!-- Step 5: Ready -->
      <div
        class="flex-1 flex flex-col items-center justify-center text-center space-y-6"
      >
        <div
          class="h-20 w-20 rounded-full gradient-love flex items-center justify-center animate-soft-pulse"
        >
          <Heart size={36} class="text-white" />
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-bold text-white">You're all set, {name}</h1>
          <p
            class="text-sm text-neutral-400 max-w-[280px] mx-auto leading-relaxed"
          >
            Remember — you get 20 swipes and 5 likes per day. Make each one
            count.
          </p>
        </div>

        <div
          class="text-left w-full max-w-xs space-y-2 p-4 rounded-xl bg-neutral-800/30 border border-neutral-800/50"
        >
          <p
            class="text-xs font-medium text-neutral-500 uppercase tracking-wider"
          >
            Your profile
          </p>
          <p class="text-white font-semibold">
            {name}, {age}
          </p>
          <p class="text-sm text-neutral-400">
            {location || "Location not set"}
          </p>
          <div class="flex flex-wrap gap-1 mt-1">
            {#each selectedTags.slice(0, 5) as tag}
              <span
                class="text-[10px] px-2 py-0.5 rounded-full bg-neutral-700/50 text-neutral-300"
                >{tag}</span
              >
            {/each}
            {#if selectedTags.length > 5}
              <span
                class="text-[10px] px-2 py-0.5 rounded-full bg-neutral-700/50 text-neutral-400"
                >+{selectedTags.length - 5}</span
              >
            {/if}
          </div>
        </div>

        <Button
          class="w-full max-w-xs gradient-love text-white border-0 hover:opacity-90"
          on:click={finish}
          disabled={saving}
        >
          {#if saving}
            <span class="flex items-center gap-2">
              <span
                class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              Setting up...
            </span>
          {:else}
            Start matching <ArrowRight size={16} class="ml-2" />
          {/if}
        </Button>
      </div>
    {/if}
  </div>

  <!-- Navigation buttons -->
  {#if step < 4}
    <div class="flex gap-3 mt-6 pb-4">
      {#if step > 0}
        <Button variant="secondary" class="flex-1" on:click={prev}>
          <ArrowLeft size={16} class="mr-1" /> Back
        </Button>
      {/if}
      <Button
        class="flex-1 {canProceed ? '' : 'opacity-50'}"
        on:click={next}
        disabled={!canProceed}
      >
        Continue <ArrowRight size={16} class="ml-1" />
      </Button>
    </div>
  {/if}
</div>
