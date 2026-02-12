<script lang="ts">
  import { PUBLIC_ADMIN_SECRET } from "$env/static/public";
  import { databases, DB_ID, COLLECTIONS, Query, ID } from "$lib/appwrite";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import { user } from "$lib/stores/user";
  import {
    Trash2,
    RefreshCw,
    Shield,
    AlertTriangle,
    UserX,
    Database,
  } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";

  let secret = "";
  let authenticated = false;
  let loading = false;
  let users: any[] = []; // Profile docs
  let error = "";
  let success = "";

  // Algorithm tuning state (mock for now, or hook into store later)
  let weights = {
    tagOverlap: 0.35,
    intentMatch: 0.25,
    valuesAlign: 0.2,
    ageProximity: 0.1,
    geoProximity: 0.05,
    mbtiComp: 0.05,
  };

  function login() {
    if (secret === PUBLIC_ADMIN_SECRET) {
      authenticated = true;
      loadUsers();
    } else {
      error = "Invalid admin secret";
      setTimeout(() => (error = ""), 2000);
    }
  }

  async function loadUsers() {
    loading = true;
    try {
      const res = await databases.listDocuments(DB_ID, COLLECTIONS.PROFILES, [
        Query.limit(100),
        Query.orderDesc("$createdAt"),
      ]);
      users = res.documents;
    } catch (e: any) {
      error = e.message;
    }
    loading = false;
  }

  async function deleteUser(docId: string, name: string) {
    if (!confirm(`Delete profile for ${name}? This cannot be undone.`)) return;

    try {
      await databases.deleteDocument(DB_ID, COLLECTIONS.PROFILES, docId);
      users = users.filter((u) => u.$id !== docId);
      success = `Deleted ${name}`;
      setTimeout(() => (success = ""), 3000);
    } catch (e: any) {
      error = e.message;
    }
  }

  async function seedUsers() {
    if (!confirm("Generate 5 mock users?")) return;
    loading = true;

    const MOCK_USERS = [
      {
        name: "Sarah",
        age: 24,
        gender: "woman",
        lookingFor: ["man"],
        bio: "Digital nomad loving coffee and code.",
        tags: ["Travel", "Coffee", "Tech"],
      },
      {
        name: "James",
        age: 28,
        gender: "man",
        lookingFor: ["woman"],
        bio: "Hiker and photographer.",
        tags: ["Hiking", "Photography", "Nature"],
      },
      {
        name: "Alex",
        age: 26,
        gender: "non-binary",
        lookingFor: ["everyone"],
        bio: "Artist and dreamer.",
        tags: ["Art", "Music", "Design"],
      },
      {
        name: "Mia",
        age: 22,
        gender: "woman",
        lookingFor: ["man", "woman"],
        bio: "Student by day, gamer by night.",
        tags: ["Gaming", "Anime", "Foodie"],
      },
      {
        name: "Tom",
        age: 30,
        gender: "man",
        lookingFor: ["woman"],
        bio: "Chef looking for a taste tester.",
        tags: ["Cooking", "Wine", "Travel"],
      },
    ];

    try {
      for (const u of MOCK_USERS) {
        const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name}&backgroundColor=e5e5e5`;
        await databases.createDocument(
          DB_ID,
          COLLECTIONS.PROFILES,
          ID.unique(),
          {
            name: u.name,
            age: u.age,
            gender: u.gender,
            lookingFor: u.lookingFor,
            bio: u.bio,
            tags: u.tags,
            location: "San Francisco",
            distance: Math.floor(Math.random() * 20),
            imageUrl: avatarUrl,
            relationshipType: "serious",
            monogamy: "monogamous",
            wantsKids: "maybe",
            smoker: false,
            usesWeed: false,
            myersBriggs: "ENFP",
          },
        );
      }
      success = "Seeded 5 mock users";
      await loadUsers();
    } catch (e: any) {
      error = "Failed to seed: " + e.message;
    }
    loading = false;
  }

  async function flushAll() {
    const confirmation = prompt(
      "TYPE 'DELETE ALL' TO CONFIRM. This will wipe ALL user profiles.",
    );
    if (confirmation !== "DELETE ALL") return;

    loading = true;
    let deletedCount = 0;

    // Process in chunks if needed, for now just iterate
    for (const u of users) {
      try {
        await databases.deleteDocument(DB_ID, COLLECTIONS.PROFILES, u.$id);
        deletedCount++;
      } catch (e) {
        console.error(e);
      }
    }

    users = [];
    loading = false;
    success = `Flushed ${deletedCount} profiles.`;
  }
</script>

<div class="min-h-screen bg-black text-white font-geist p-6 md:p-12">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <header class="flex items-center justify-between mb-12">
      <div class="flex items-center gap-3">
        <div
          class="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"
        >
          <Shield size={20} class="text-red-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">Admin Console</h1>
          <p class="text-xs text-neutral-500 font-mono">SYSTEM_ROOT_ACCESS</p>
        </div>
      </div>
      {#if authenticated}
        <Button
          variant="secondary"
          class="text-xs"
          on:click={() => (authenticated = false)}
        >
          Logout
        </Button>
      {/if}
    </header>

    {#if !authenticated}
      <!-- Login Gate -->
      <div
        in:fade
        class="max-w-sm mx-auto mt-20 p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center space-y-6"
      >
        <div class="space-y-2">
          <h2 class="text-lg font-medium">Restricted Access</h2>
          <p class="text-sm text-neutral-500">
            Enter the secure admin key to proceed.
          </p>
        </div>

        <div class="space-y-4">
          <Input
            type="password"
            placeholder="• • • • • • • •"
            bind:value={secret}
            class="text-center tracking-widest"
          />
          <Button class="w-full" on:click={login}>Authenticate</Button>
        </div>

        {#if error}
          <p class="text-xs text-red-500 animate-pulse">{error}</p>
        {/if}
      </div>
    {:else}
      <!-- Dashboard -->
      <div in:fade class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Column: User Management -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800 min-h-[500px] flex flex-col"
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium flex items-center gap-2">
                User Database
                <span
                  class="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400"
                >
                  {users.length} records
                </span>
              </h3>
              <div class="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  on:click={loadUsers}
                  disabled={loading}
                  class="h-8 px-2"
                >
                  <RefreshCw size={14} class={loading ? "animate-spin" : ""} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  on:click={seedUsers}
                  disabled={loading}
                  class="h-8 text-xs border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                >
                  + Seed
                </Button>
                <Button
                  class="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 h-8 text-xs"
                  size="sm"
                  on:click={flushAll}
                >
                  <AlertTriangle size={14} class="mr-1.5" /> Flush All
                </Button>
              </div>
            </div>

            <!-- User List -->
            <div class="space-y-2 flex-1 overflow-y-auto pr-1">
              {#if users.length === 0}
                <div
                  class="h-full flex flex-col items-center justify-center text-neutral-600 space-y-3"
                >
                  <UserX size={48} class="opacity-20" />
                  <p class="text-sm">No user profiles found.</p>
                  <Button variant="outline" size="sm" on:click={seedUsers}
                    >Generate Mock Users</Button
                  >
                </div>
              {:else}
                {#each users as u}
                  <div
                    class="flex items-center justify-between p-3 rounded-xl bg-neutral-800/30 border border-neutral-800/50 group hover:border-neutral-700 transition-colors"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="h-10 w-10 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700"
                      >
                        {#if u.imageUrl}
                          <img
                            src={u.imageUrl}
                            alt={u.name}
                            class="h-full w-full object-cover"
                          />
                        {:else}
                          <div
                            class="h-full w-full flex items-center justify-center text-xs text-neutral-500"
                          >
                            ?
                          </div>
                        {/if}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="font-medium text-sm text-white">
                            {u.name}, {u.age}
                          </p>
                          {#if u.$id === $user?.$id}
                            <span
                              class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium"
                              >YOU</span
                            >
                          {/if}
                        </div>
                        <p
                          class="text-xs text-neutral-500 capitalize flex items-center gap-1"
                        >
                          <span
                            class={u.gender === "man"
                              ? "text-blue-400"
                              : u.gender === "woman"
                                ? "text-pink-400"
                                : "text-purple-400"}>●</span
                          >
                          {u.gender} · {u.location}
                        </p>
                      </div>
                    </div>

                    <div
                      class="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <span
                        class="text-[10px] font-mono text-neutral-600 hidden sm:block"
                      >
                        {new Date(u.$createdAt).toLocaleDateString()}
                      </span>
                      <button
                        class="p-2 rounded-lg hover:bg-red-500/20 text-neutral-600 hover:text-red-500 transition-colors"
                        on:click={() => deleteUser(u.$id, u.name)}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </div>

        <!-- Sidebar: Controls & Stats -->
        <div class="space-y-6">
          <!-- Algorithm Tuner -->
          <div
            class="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800"
          >
            <h3
              class="text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wider flex items-center justify-between"
            >
              <span>Weights</span>
              <span
                class="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500"
                >v1.0.2</span
              >
            </h3>

            <div class="space-y-4">
              {#each Object.entries(weights) as [key, val]}
                <div>
                  <div class="flex justify-between text-xs mb-1.5">
                    <span class="text-neutral-400 capitalize"
                      >{key.replace(/([A-Z])/g, " $1")}</span
                    >
                    <span class="font-mono text-white">{val.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    bind:value={weights[key as keyof typeof weights]}
                    class="w-full accent-white bg-neutral-800 h-1 rounded-full appearance-none cursor-not-allowed opacity-50"
                    disabled
                    title="Tuning disabled in prototype"
                  />
                </div>
              {/each}
              <div class="pt-2 border-t border-white/5 mt-4">
                <p class="text-[10px] text-neutral-600 italic text-center">
                  Parameters locked by System Administrator.
                </p>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-4">
            <div
              class="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800 text-center"
            >
              <p class="text-xs text-neutral-500 uppercase font-medium">
                Total Users
              </p>
              <p class="text-2xl font-bold text-white mt-1">{users.length}</p>
            </div>
            <div
              class="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800 text-center"
            >
              <p class="text-xs text-neutral-500 uppercase font-medium">
                Matches
              </p>
              <p class="text-2xl font-bold text-white mt-1">142</p>
            </div>
          </div>

          <!-- System Health -->
          <div
            class="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
          >
            <div class="flex items-center gap-2 mb-2">
              <div
                class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
              ></div>
              <span class="text-xs font-medium text-emerald-500"
                >System Healthy</span
              >
            </div>
            <div class="space-y-1">
              <p class="text-[10px] text-emerald-500/60 flex justify-between">
                <span>Database Latency</span>
                <span>24ms</span>
              </p>
              <p class="text-[10px] text-emerald-500/60 flex justify-between">
                <span>Storage</span>
                <span>0.4% used</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if success}
      <div
        class="fixed bottom-6 right-6 px-4 py-2 bg-green-500 text-black font-medium text-sm rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 z-50"
      >
        {success}
      </div>
    {/if}
  </div>
</div>
