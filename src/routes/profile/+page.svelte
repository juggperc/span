<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Tag from "$lib/components/ui/Tag.svelte";
  import { Settings, Edit2, Save, LogOut, X } from "lucide-svelte";
  import { user, logout } from "$lib/stores/user";
  import { anchor } from "$lib/stores/anchor";
  import { getUserProfile, upsertProfile } from "$lib/appwrite-db";
  import type { ProfileDoc } from "$lib/appwrite-db";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let editing = false;
  let loading = true;

  // Profile state
  let name = "";
  let age = 0;
  let location = "";
  let bio = "";
  let tags: string[] = [];
  let imageUrl = "";
  let myersBriggs = "";
  let smoker = false;
  let usesWeed = false;
  let wantsKids: "yes" | "no" | "maybe" = "maybe";
  let relationshipType: "casual" | "serious" | "friends" | "open" = "serious";
  let monogamy: "monogamous" | "non-monogamous" | "open" = "monogamous";

  // Edit state
  let editBio = "";
  let editName = "";
  let newTag = "";

  onMount(async () => {
    if ($user) {
      const profile = await getUserProfile($user.$id);
      if (profile) {
        name = profile.name;
        age = profile.age;
        location = profile.location;
        bio = profile.bio;
        tags = profile.tags || [];
        imageUrl = profile.imageUrl;
        myersBriggs = profile.myersBriggs;
        smoker = profile.smoker;
        usesWeed = profile.usesWeed;
        wantsKids = profile.wantsKids;
        relationshipType = profile.relationshipType;
        monogamy = profile.monogamy;
      } else {
        // First time — use Appwrite user data as seed
        name = $user.name || "New User";
        bio = "";
        location = "";
        imageUrl =
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&auto=format&fit=crop&q=60";
      }
    }
    loading = false;
  });

  function startEditing() {
    editName = name;
    editBio = bio;
    editing = true;
  }

  async function saveProfile() {
    if (!$user) return;
    name = editName;
    bio = editBio;
    editing = false;

    await upsertProfile($user.$id, {
      name,
      age,
      location,
      bio,
      tags,
      imageUrl,
      myersBriggs,
      smoker,
      usesWeed,
      wantsKids,
      relationshipType,
      monogamy,
      anchorAnswer: $anchor.answer || undefined,
    });
  }

  function addTag() {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      tags = [...tags, newTag.trim()];
      newTag = "";
    }
  }

  function removeTag(tag: string) {
    tags = tags.filter((t) => t !== tag);
  }

  async function handleLogout() {
    await logout();
    goto("/login");
  }
</script>

<div class="h-full w-full relative flex flex-col">
  {#if loading}
    <div class="flex-1 flex items-center justify-center animate-fade-in">
      <div class="h-1 w-16 bg-neutral-800 rounded-full overflow-hidden">
        <div
          class="h-full w-8 bg-white/30 rounded-full"
          style="animation: loading-bar 1.2s ease-in-out infinite;"
        ></div>
      </div>
    </div>
  {:else}
    <!-- Cover/Image Area -->
    <div class="h-[38%] w-full relative">
      <img
        src={imageUrl}
        alt={name}
        class="w-full h-full object-cover mask-gradient"
      />
      <div
        class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"
      ></div>

      <div class="absolute top-6 right-6 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          class="bg-black/20 backdrop-blur-md text-white hover:bg-black/40"
          on:click={handleLogout}
        >
          <LogOut size={18} />
        </Button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 px-6 -mt-12 relative z-10 overflow-y-auto pb-24">
      <div class="flex justify-between items-end mb-4">
        <div>
          {#if editing}
            <input
              bind:value={editName}
              class="text-3xl font-bold text-white bg-transparent border-b border-neutral-700 outline-none w-[200px]"
            />
          {:else}
            <h1 class="text-3xl font-bold text-white">
              {name}{age ? `, ${age}` : ""}
            </h1>
          {/if}
          <p class="text-neutral-400">{location || "Set your location"}</p>
          {#if $user}
            <p class="text-neutral-600 text-xs mt-1">{$user.email}</p>
          {/if}
        </div>
        {#if editing}
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              class="rounded-full px-3"
              on:click={() => (editing = false)}
            >
              <X size={14} />
            </Button>
            <Button size="sm" class="rounded-full px-4" on:click={saveProfile}>
              <Save size={14} class="mr-1" /> Save
            </Button>
          </div>
        {:else}
          <Button
            size="sm"
            variant="secondary"
            class="rounded-full px-4"
            on:click={startEditing}
          >
            <Edit2 size={14} class="mr-2" /> Edit
          </Button>
        {/if}
      </div>

      <div class="space-y-6">
        <!-- Bio -->
        <section>
          <h3
            class="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2"
          >
            About
          </h3>
          {#if editing}
            <textarea
              bind:value={editBio}
              placeholder="Tell people about yourself..."
              class="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-3 px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none h-24"
            ></textarea>
          {:else}
            <p class="text-neutral-200 leading-relaxed">
              {bio || "No bio yet. Tap Edit to add one."}
            </p>
          {/if}
        </section>

        <!-- Anchor Answer -->
        {#if $anchor.answer}
          <section>
            <h3
              class="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2"
            >
              Anchor Answer
            </h3>
            <div
              class="p-3 rounded-xl bg-neutral-800/30 border border-neutral-700/30"
            >
              <p class="text-xs text-neutral-500 mb-1">
                {$anchor.currentQuestion}
              </p>
              <p class="text-sm text-neutral-200 italic">
                "{$anchor.answer}"
              </p>
            </div>
          </section>
        {/if}

        <!-- Tags -->
        <section>
          <h3
            class="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3"
          >
            Interests
          </h3>
          <div class="flex flex-wrap gap-2">
            {#each tags as tag}
              {#if editing}
                <button
                  class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 hover:border-red-500/30 hover:text-red-400 transition-colors"
                  on:click={() => removeTag(tag)}
                >
                  {tag}
                  <X size={10} />
                </button>
              {:else}
                <Tag active>{tag}</Tag>
              {/if}
            {/each}
            {#if editing}
              <div class="flex items-center gap-1">
                <input
                  bind:value={newTag}
                  placeholder="+ Add"
                  on:keydown={(e) => e.key === "Enter" && addTag()}
                  class="w-20 bg-transparent border-b border-neutral-700 text-xs text-white outline-none placeholder:text-neutral-600 py-1"
                />
              </div>
            {/if}
          </div>
        </section>

        <!-- Preferences -->
        <section>
          <h3
            class="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3"
          >
            Preferences
          </h3>
          <div class="space-y-2 text-sm text-neutral-300">
            <div class="flex justify-between py-2 border-b border-white/5">
              <span>MBTI</span>
              <span class="text-white font-medium">
                {myersBriggs || "Not set"}
              </span>
            </div>
            <div class="flex justify-between py-2 border-b border-white/5">
              <span>Looking for</span>
              <span class="text-white font-medium capitalize">
                {relationshipType}
              </span>
            </div>
            <div class="flex justify-between py-2 border-b border-white/5">
              <span>Style</span>
              <span class="text-white font-medium capitalize">{monogamy}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-white/5">
              <span>Kids</span>
              <span class="text-white font-medium capitalize">{wantsKids}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  {/if}

  <Navbar />
</div>

<style>
  .mask-gradient {
    mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  }
  @keyframes loading-bar {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(200%);
    }
    100% {
      transform: translateX(-100%);
    }
  }
</style>
