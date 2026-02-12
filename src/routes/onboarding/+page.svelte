<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Tag from "$lib/components/ui/Tag.svelte";
  import {
    Heart,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Share,
    Plus,
    MoreVertical,
    Smartphone,
    Check,
    Camera,
    User,
    MessageCircle,
  } from "lucide-svelte";
  import { user } from "$lib/stores/user";
  import { upsertProfile } from "$lib/appwrite-db";
  import { goto } from "$app/navigation"; // Kept for type safety, but unused in runtime fallback
  import { writeStorage } from "$lib/storage";
  import { log, error } from "$lib/logger";

  let step = 0;
  let saving = false;

  // Profile data
  let name = "";
  let age = "";
  let location = "";
  let bio = "";
  let myersBriggs = "";
  let selectedTags: string[] = [];

  // Explicit entry types to satisfy typescript
  let gender: "man" | "woman" | "non-binary" | "trans" | "other" | "" = "";
  let lookingFor: string[] = [];
  let wantsKids: "yes" | "no" | "maybe" = "maybe";
  let relationshipType: "serious" | "casual" | "friends" | "open" = "serious";
  let monogamy: "monogamous" | "non-monogamous" | "open" = "monogamous";

  // Mock avatar until we have real photo upload
  $: avatarUrl = name
    ? `https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=e5e5e5`
    : "";

  const AVAILABLE_TAGS = [
    "Coffee",
    "Hiking",
    "Photography",
    "Cooking",
    "Gaming",
    "Travel",
    "Music",
    "Art",
    "Reading",
    "Fitness",
    "Tech",
    "Movies",
    "Yoga",
    "Foodie",
    "Nature",
    "Dancing",
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

  function nextStep() {
    if (step < steps.length - 1) {
      step++;
    }
  }

  function prevStep() {
    if (step > 0) {
      step--;
    }
  }

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter((t) => t !== tag);
    } else {
      if (selectedTags.length < 8) {
        selectedTags = [...selectedTags, tag];
      }
    }
  }

  function toggleLookingFor(g: string) {
    if (lookingFor.includes(g)) {
      // Don't allow empty selection
      if (lookingFor.length > 1) {
        lookingFor = lookingFor.filter((x) => x !== g);
      }
    } else {
      lookingFor = [...lookingFor, g];
    }
  }

  async function finish() {
    if (!$user) return;
    saving = true;

    try {
      await upsertProfile($user.$id, {
        location: location.trim() || "Unknown",
        bio: bio.trim(),
        tags: selectedTags,
        imageUrl: avatarUrl,
        distance: 0,
        myersBriggs: myersBriggs || "INFJ",
        smoker: false,
        usesWeed: false,
        wantsKids,
        relationshipType,
        monogamy,
        name: name.trim(),
        age: parseInt(age) || 18,
        gender: (gender || "non-binary") as any,
        lookingFor: lookingFor.length ? lookingFor : ["everyone"],
      });
      log("Profile saved successfully");

      // Mark onboarding complete
      writeStorage("span_onboarded", true);

      // Force navigation using window.location to avoid goto() reference errors
      window.location.href = "/";
    } catch (e: any) {
      error("Onboarding save failed:", e.message || e);

      // Alert the user so they know WHY it failed
      alert(
        "Failed to save profile. Please check that the Appwrite 'profiles' collection exists. \n\nError: " +
          (e.message || e),
      );

      // DO NOT REDIRECT so they can try again or see the error
    } finally {
      saving = false;
    }
  }

  const steps = [
    { title: "Photo", icon: Camera },
    { title: "About You", icon: User },
    { title: "Interests", icon: Sparkles },
    { title: "Preferences", icon: Heart },
    { title: "Your Bio", icon: MessageCircle },
    { title: "Install", icon: Smartphone },
    { title: "Ready", icon: ArrowRight },
  ];
</script>

<div class="h-full w-full flex flex-col p-6 pt-12 overflow-y-auto">
  <!-- Progress bar -->
  <div class="flex gap-2 mb-8">
    {#each Array(6) as _, i}
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
      <!-- Step 0: Identity (Name, Age, Gender) -->
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">About you</h1>
          <p class="text-sm text-neutral-400">
            Let's create your digital twin.
          </p>
        </div>

        <!-- Generated Avatar Preview -->
        <div class="flex justify-center py-2">
          <div
            class="relative h-24 w-24 rounded-full overflow-hidden border-2 border-neutral-700 bg-neutral-800"
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <Input label="Your name" placeholder="First name" bind:value={name} />

        <div class="grid grid-cols-2 gap-4">
          <Input label="Age" placeholder="25" type="number" bind:value={age} />
          <Input label="Location" placeholder="City" bind:value={location} />
        </div>

        <!-- Gender Selection -->
        <div>
          <span class="text-xs font-medium text-neutral-400 pl-1 block mb-2"
            >I am a</span
          >
          <div class="flex flex-wrap gap-2">
            {#each ["man", "woman", "non-binary", "trans", "other"] as g}
              <button
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize {gender ===
                g
                  ? 'bg-white text-black'
                  : 'bg-neutral-800/60 text-neutral-400 border border-neutral-800 hover:border-neutral-600'}"
                on:click={() => (gender = g)}
              >
                {g}
              </button>
            {/each}
          </div>
        </div>

        <div>
          <span class="text-xs font-medium text-neutral-400 pl-1 block mb-2"
            >MBTI (optional)</span
          >
          <div class="flex flex-wrap gap-1.5 prose-invert">
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
      <!-- Step 1: Interests -->
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
      <!-- Step 2: Preferences -->
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">
            What you're seeking
          </h1>
          <p class="text-sm text-neutral-400">
            These help us match you with the right people.
          </p>
        </div>

        <!-- Looking For (Gender) -->
        <div>
          <span class="text-xs font-medium text-neutral-400 pl-1 block mb-2"
            >Interested in</span
          >
          <div class="flex flex-wrap gap-2">
            {#each ["man", "woman", "non-binary", "trans", "other"] as g}
              <button
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize {lookingFor.includes(
                  g,
                )
                  ? 'bg-white text-black'
                  : 'bg-neutral-800/60 text-neutral-400 border border-neutral-800 hover:border-neutral-600'}"
                on:click={() => toggleLookingFor(g)}
              >
                {g}
              </button>
            {/each}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Kids -->
          <div>
            <span class="text-xs font-medium text-neutral-400 pl-1 block mb-2"
              >Wants kids?</span
            >
            <select
              bind:value={wantsKids}
              class="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="maybe">Maybe</option>
            </select>
          </div>
          <!-- Relationship -->
          <div>
            <span class="text-xs font-medium text-neutral-400 pl-1 block mb-2"
              >Looking for</span
            >
            <select
              bind:value={relationshipType}
              class="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-500"
            >
              <option value="serious">Serious</option>
              <option value="casual">Casual</option>
              <option value="friendship">Friends</option>
              <option value="open">Open</option>
            </select>
          </div>
        </div>
      </div>
    {:else if step === 3}
      <!-- Step 3: Bio -->
      <div class="space-y-5">
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">Your story</h1>
          <p class="text-sm text-neutral-400">
            Tell us about yourself. Avoid clichés.
          </p>
        </div>

        <div class="relative">
          <textarea
            bind:value={bio}
            placeholder="I'm a..."
            class="w-full h-40 bg-neutral-800/50 border border-neutral-700 rounded-2xl p-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
          ></textarea>
          <span
            class="absolute bottom-4 right-4 text-xs text-neutral-500 font-mono"
            >{bio.length}/300</span
          >
        </div>
      </div>
    {:else if step === 4}
      <!-- Step 4: Install (Skipped for PWA logic usually, but kept for flow) -->
      <div class="space-y-6 text-center pt-8">
        <div
          class="h-24 w-24 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto shadow-2xl shadow-black"
        >
          <Smartphone size={48} class="text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white mb-2">Install App</h1>
          <p class="text-sm text-neutral-400 max-w-xs mx-auto">
            For the best experience, add Span to your home screen.
          </p>
        </div>
        <div
          class="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 text-left text-xs text-neutral-300 space-y-2"
        >
          <p>
            <span class="font-bold text-white">1.</span> Tap the Share icon <Share
              size={12}
              class="inline"
            />
          </p>
          <p>
            <span class="font-bold text-white">2.</span> Scroll down to "Add to
            Home Screen" <Plus size={12} class="inline" />
          </p>
        </div>
      </div>
    {:else if step === 5}
      <!-- Step 5: Ready -->
      <div class="space-y-6 text-center pt-12">
        <div
          class="h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto"
        >
          <Check size={48} class="text-emerald-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white mb-2">You're ready</h1>
          <p class="text-sm text-neutral-400 max-w-xs mx-auto">
            Your profile is set. Let's find your people.
          </p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Footer Controls -->
  <div class="mt-8 flex justify-between items-center">
    {#if step > 0}
      <button
        class="text-sm text-neutral-500 hover:text-white transition-colors px-2 py-1"
        on:click={prevStep}
      >
        Back
      </button>
    {:else}
      <div></div>
    {/if}

    {#if step < 5}
      <Button on:click={nextStep} class="px-8" disabled={step === 0 && !name}>
        Next <ArrowRight size={16} class="ml-2" />
      </Button>
    {:else}
      <Button
        on:click={finish}
        class="px-8 bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400"
        disabled={saving}
        loading={saving}
      >
        Start Swiping
      </Button>
    {/if}
  </div>
</div>
