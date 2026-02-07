<script>
  import { page } from "$app/stores";
  import { Home, Search, User, MessageCircle } from "lucide-svelte";

  $: path = $page.url.pathname;

  function isActive(route) {
    return path === route
      ? "text-white scale-110"
      : "text-neutral-500 hover:text-neutral-300";
  }
</script>

<nav
  class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[350px] bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-full px-6 py-4 flex justify-between items-center shadow-2xl z-50"
>
  <a
    href="/"
    class="flex flex-col items-center transition-all duration-300 {isActive(
      '/',
    )}"
  >
    <Home size={24} strokeWidth={2} />
  </a>
  <a
    href="/search"
    class="flex flex-col items-center transition-all duration-300 {isActive(
      '/search',
    )}"
  >
    <Search size={24} strokeWidth={2} />
  </a>
  <a
    href="/messages"
    class="flex flex-col items-center transition-all duration-300 {isActive(
      '/messages',
    )}"
  >
    <MessageCircle size={24} strokeWidth={2} />
  </a>
  <a
    href="/profile"
    class="flex flex-col items-center transition-all duration-300 {isActive(
      '/profile',
    )}"
  >
    <User size={24} strokeWidth={2} />
  </a>
</nav>
