<script>
  import { getContext, onDestroy, onMount } from "svelte"

  export let color

  /** @type {HTMLElement} */
  let blob
  let speedX = Math.random() * 2
  let speedY = Math.random() * 2
  let context = getContext("coords")
  let parentBounds
  let frame

  let unsub = $context.coords.subscribe(({ x, y }) => {
    if ($context.hovered && blob) {
      blob.style.setProperty("--left", x - 32)
      blob.style.setProperty("--top", y - 32)
    }
  })
  function moveBlob() {
    if (blob && !$context.hovered) {
      let bounds = blob.getBoundingClientRect()
      let computed = getComputedStyle(blob)
      let left = Number(computed.getPropertyValue("--left"))
      let top = Number(computed.getPropertyValue("--top"))
      if (left + bounds.width + 50 > parentBounds.right || left <= -5) {
        speedX = -speedX
      }
      if (
        top + bounds.height + 5 > parentBounds.bottom ||
        top < parentBounds.top
      ) {
        speedY = -speedY
      }

      let newLeft = left + speedX
      let newTop = top + speedY
      $context.coords.set({ x: newLeft, y: newTop })
      blob.style.setProperty("--left", newLeft)
      blob.style.setProperty("--top", newTop)
    }
    frame = requestAnimationFrame(moveBlob)
  }

  onMount(() => {
    let container = document.querySelector("[data-blob-container]")
    parentBounds = container.getBoundingClientRect()

    let initialX = Math.floor(Math.random() * parentBounds.width)
    let initialY = Math.floor(Math.random() * parentBounds.height)
    blob.style.setProperty("--left", initialX)
    blob.style.setProperty("--top", initialY)
    blob.style.display = "block"

    moveBlob()
  })

  onDestroy(unsub)
</script>

<div
  bind:this={blob}
  style="transform: translate(calc(var(--left) * 1px), calc(var(--top) * 1px))"
  class="w-16 h-16 absolute rounded-full p-2 {color}"
></div>

<style>
  div {
    display: none;
  }
</style>
