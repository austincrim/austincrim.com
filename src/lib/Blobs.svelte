<script lang="ts">
  import { setContext } from "svelte"
  import { spring } from "svelte/motion"
  import { writable } from "svelte/store"
  import Blob from "./Blob.svelte"

  let coords = spring({ x: 0, y: 0 }, { damping: 0.2, stiffness: 0.1 })
  let hovered = false
  let context = writable({ coords, hovered })
  setContext("coords", context)

  function handleMouse(e: MouseEvent) {
    coords.set({ x: e.offsetX, y: e.offsetY })
  }
  function handleTouchMove(e: TouchEvent) {
    const touch = e.touches[0]
    const target = e.target as HTMLElement
    const rect = target.getBoundingClientRect()

    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    coords.set({ x, y })
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  data-blob-container
  on:mousemove={handleMouse}
  on:mouseleave={() => context.update((c) => ({ ...c, hovered: false }))}
  on:mouseenter={() => context.update((c) => ({ ...c, hovered: true }))}
  on:touchmove={handleTouchMove}
  on:touchstart={() => context.update((c) => ({ ...c, hovered: true }))}
  on:touchend={() => context.update((c) => ({ ...c, hovered: false }))}
  class="relative overflow-hidden border border-slate-200 dark:border-slate-800 rounded about touch-pan-x"
>
  <Blob color="bg-blue-200 dark:bg-blue-800" />
  <Blob color="bg-fuchsia-200 dark:bg-fuchsia-800" />
  <Blob color="bg-indigo-200 dark:bg-indigo-800" />
  <p class="text-xl leading-loose max-w-[80ch] relative p-6 backdrop-blur-xl">
    I started out as a 19-year old COBOL programmer and now I work on the web.
    Chat with me about <a class="link" href="https://svelte.dev">Svelte</a>,
    <a class="link" href="https://joshandaustinpodcast.com"> my podcast </a>, or
    making the web better.
  </p>
</div>
