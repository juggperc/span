<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Tag from "$lib/components/ui/Tag.svelte";
  import { Settings, Edit2 } from "lucide-svelte";

  // Mock user data
  const user = {
    name: "Alex",
    age: 26,
    location: "Bangkok, TH",
    bio: "Building things. Exploring the world. Always learning.",
    tags: ["Coding", "Travel", "ENTP", "Coffee"],
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D",
  };
</script>

<div class="h-full w-full relative flex flex-col">
  <!-- Cover/Image Area -->
  <div class="h-[40%] w-full relative">
    <img
      src={user.image}
      alt={user.name}
      class="w-full h-full object-cover mask-gradient"
    />
    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"
    ></div>

    <div class="absolute top-6 right-6">
      <Button
        variant="ghost"
        size="icon"
        class="bg-black/20 backdrop-blur-md text-white hover:bg-black/40"
      >
        <Settings size={20} />
      </Button>
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 px-6 -mt-12 relative z-10 overflow-y-auto pb-24">
    <div class="flex justify-between items-end mb-4">
      <div>
        <h1 class="text-3xl font-bold text-white">{user.name}, {user.age}</h1>
        <p class="text-neutral-400">{user.location}</p>
      </div>
      <Button size="sm" variant="secondary" class="rounded-full px-4">
        <Edit2 size={14} class="mr-2" /> Edit
      </Button>
    </div>

    <div class="space-y-6">
      <!-- Bio -->
      <section>
        <h3
          class="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2"
        >
          About
        </h3>
        <p class="text-neutral-200 leading-relaxed">
          {user.bio}
        </p>
      </section>

      <!-- Tags -->
      <section>
        <h3
          class="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3"
        >
          Interests
        </h3>
        <div class="flex flex-wrap gap-2">
          {#each user.tags as tag}
            <Tag active>{tag}</Tag>
          {/each}
          <Tag interactive>+ Add Interest</Tag>
        </div>
      </section>

      <!-- Basic Info -->
      <section>
        <h3
          class="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3"
        >
          Basics
        </h3>
        <div class="space-y-2 text-sm text-neutral-300">
          <div class="flex justify-between py-2 border-b border-white/5">
            <span>Work</span>
            <span class="text-white">Software Engineer</span>
          </div>
          <div class="flex justify-between py-2 border-b border-white/5">
            <span>Education</span>
            <span class="text-white">University of Tech</span>
          </div>
          <div class="flex justify-between py-2 border-b border-white/5">
            <span>Height</span>
            <span class="text-white">180cm</span>
          </div>
        </div>
      </section>
    </div>
  </div>

  <Navbar />
</div>

<style>
  .mask-gradient {
    mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  }
</style>
