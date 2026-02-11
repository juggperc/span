<script>
  import { page } from "$app/stores";
  import { Home, Search, User, MessageCircle } from "lucide-svelte";

  $: path = $page.url.pathname;

  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  $: activeIndex = items.findIndex((item) => item.href === path);
</script>

<nav
  class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[88%] max-w-[340px] bg-neutral-900/90 backdrop-blur-xl border border-white/[0.06] rounded-full px-2 py-2 flex justify-between items-center shadow-2xl z-50"
>
  <!-- Sliding pill indicator -->
  <div
    class="absolute h-10 w-10 bg-white/[0.08] rounded-full transition-all duration-300 ease-out"
    style="left: calc({activeIndex} * 25% + 12.5% - 20px);"
  ></div>

  {#each items as item}
    <a
      href={item.href}
      class="relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                {path === item.href
        ? 'text-white scale-105'
        : 'text-neutral-500 hover:text-neutral-300 active:scale-90'}"
      aria-label={item.label}
    >
      <svelte:component
        this={item.icon}
        size={22}
        strokeWidth={path === item.href ? 2.5 : 1.8}
      />
    </a>
  {/each}
</nav>
