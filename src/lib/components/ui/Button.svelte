<script lang="ts">
    import { clsx, type ClassValue } from 'clsx';
    import { twMerge } from 'tailwind-merge';

    export let variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary';
    export let size: 'sm' | 'md' | 'lg' | 'icon' = 'md';
    export let disabled: boolean = false;
    export let href: string | undefined = undefined;
    export let className: ClassValue | undefined = undefined;

    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95";

    const variants = {
        primary: "bg-white text-black hover:bg-neutral-200",
        secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
        outline: "border border-neutral-700 bg-transparent hover:bg-neutral-800 text-white",
        ghost: "hover:bg-neutral-800 text-neutral-300 hover:text-white",
        danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    };

    const sizes = {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-8 py-2 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
    };

    $: classes = twMerge(
        baseStyles,
        variants[variant],
        sizes[size],
        className
    );
</script>

{#if href}
    <a {href} class={classes} {...$$restProps}>
        <slot />
    </a>
{:else}
    <button type="button" class={classes} {disabled} on:click {...$$restProps}>
        <slot />
    </button>
{/if}
