<script>
    import '../app.css';
    import { onMount } from 'svelte';
    import { initUser } from '$lib/stores/user';
    import { browser } from '$app/environment';

    onMount(() => {
        if (browser) {
            initUser();
        }
    });
</script>

<div class="font-geist min-h-screen bg-black text-white flex flex-col items-center justify-center">
    <div class="w-full max-w-md h-screen relative bg-zinc-900/50 backdrop-blur-3xl overflow-hidden shadow-2xl sm:rounded-3xl sm:h-[850px] border border-white/5">
        <slot />
    </div>
</div>
