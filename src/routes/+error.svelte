<script>
  import { page } from "$app/stores";
  import Button from "$lib/components/ui/Button.svelte";
  import { ArrowLeft, AlertTriangle } from "lucide-svelte";
</script>

<div
  class="h-screen bg-black text-white flex flex-col items-center justify-center p-6"
>
  <div class="text-center space-y-4 animate-fade-in max-w-sm">
    <div
      class="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto"
    >
      <AlertTriangle size={28} class="text-red-400" />
    </div>

    <h1 class="text-2xl font-bold">Something went wrong</h1>

    <p class="text-neutral-400 text-sm">
      {$page.error?.message || "An unexpected error occurred."}
    </p>

    <div class="pt-4">
      <Button href="/" class="inline-flex">
        <ArrowLeft size={16} class="mr-2" /> Back to span
      </Button>
    </div>
  </div>
</div>
