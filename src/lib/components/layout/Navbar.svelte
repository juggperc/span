<script>
  import { page } from "$app/stores";
  import {
    Home,
    Search,
    User,
    MessageCircle,
    Sparkles,
    Eye,
  } from "lucide-svelte";

  $: path = $page.url.pathname;

  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/about", icon: Sparkles, label: "About" },
    { href: "/insights", icon: Eye, label: "Mirror" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  $: activeIndex = items.findIndex((item) => item.href === path);
  $: indicatorX = activeIndex * (100 / items.length) + 100 / items.length / 2;
</script>

<nav class="navbar-glass">
  <!-- Prismatic shimmer layer -->
  <div class="navbar-shimmer" aria-hidden="true"></div>

  <!-- Specular highlight band -->
  <div class="navbar-specular" aria-hidden="true"></div>

  <!-- Glow indicator (positioned behind icons) -->
  <div
    class="navbar-glow"
    style="left: {indicatorX}%;"
    aria-hidden="true"
  ></div>

  <!-- Active pill indicator -->
  <div
    class="navbar-pill"
    style="left: {indicatorX}%;"
    aria-hidden="true"
  ></div>

  <!-- Navigation items -->
  <div class="navbar-items">
    {#each items as item, i}
      <a
        href={item.href}
        class="navbar-item"
        class:active={path === item.href}
        aria-label={item.label}
      >
        <svelte:component
          this={item.icon}
          size={19}
          strokeWidth={path === item.href ? 2.4 : 1.7}
        />
        {#if path === item.href}
          <span class="navbar-label">{item.label}</span>
        {/if}
      </a>
    {/each}
  </div>
</nav>

<style>
  .navbar-glass {
    position: fixed;
    bottom: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    width: 92%;
    max-width: 380px;
    height: 56px;
    border-radius: 28px;
    z-index: 50;

    /* Multi-layer glass */
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.04) 0%,
      rgba(255, 255, 255, 0.01) 40%,
      rgba(255, 255, 255, 0.03) 100%
    );
    backdrop-filter: blur(40px) saturate(1.8) brightness(0.85);
    -webkit-backdrop-filter: blur(40px) saturate(1.8) brightness(0.85);

    /* Glass border — light refraction edge */
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow:
      /* Outer ambient shadow */
      0 8px 32px rgba(0, 0, 0, 0.5),
      /* Inner glow — top edge highlight */ inset 0 1px 0
        rgba(255, 255, 255, 0.08),
      /* Inner shadow — bottom depth */ inset 0 -1px 0 rgba(0, 0, 0, 0.2);

    overflow: hidden;
  }

  /* Prismatic shimmer — animated gradient sweep */
  .navbar-shimmer {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      105deg,
      transparent 20%,
      rgba(255, 255, 255, 0.03) 30%,
      rgba(255, 255, 255, 0.06) 35%,
      rgba(255, 255, 255, 0.03) 40%,
      transparent 50%
    );
    background-size: 200% 100%;
    animation: glass-shimmer 8s ease-in-out infinite;
    pointer-events: none;
  }

  /* Specular highlight band along the top */
  .navbar-specular {
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    border-radius: 1px;
    pointer-events: none;
  }

  /* Glow bloom behind active icon */
  .navbar-glow {
    position: absolute;
    top: 50%;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      transparent 70%
    );
    transform: translate(-50%, -50%);
    transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
    filter: blur(8px);
  }

  /* Active pill indicator — glass highlight */
  .navbar-pill {
    position: absolute;
    top: 50%;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.06);
    transform: translate(-50%, -50%);
    transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
    box-shadow:
      0 0 12px rgba(255, 255, 255, 0.03),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  /* Items container */
  .navbar-items {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 6px;
  }

  /* Individual nav item */
  .navbar-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    color: rgba(255, 255, 255, 0.35);
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-decoration: none;
    gap: 4px;
  }

  .navbar-item:hover {
    color: rgba(255, 255, 255, 0.55);
  }

  .navbar-item:active {
    transform: scale(0.88);
  }

  .navbar-item.active {
    color: rgba(255, 255, 255, 0.95);
    transform: scale(1.05);
  }

  /* Active label */
  .navbar-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0;
    transform: translateY(2px);
    animation: label-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
  }

  /* Keyframes */
  @keyframes glass-shimmer {
    0% {
      background-position: 200% 0;
    }
    50% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes label-in {
    to {
      opacity: 0.7;
      transform: translateY(0);
    }
  }
</style>
