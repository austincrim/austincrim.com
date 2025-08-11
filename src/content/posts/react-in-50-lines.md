---
title: "React from scratch in 50 lines"
lede: Let's make a super basic version of React
datePublished: 2025-08-05
draft: true
---

# React is boring now

React's current ubiquity betrays how innovative it was at the time of its release. Before React, there was mostly targeted DOM manipulation, imperatively updating pieces of the screen and keeping track of the web of connections in your head.

React came along and said, _"What if we just re-render everything all the time?"_. This removed entire classes of frontend problems. No more manual bookkeeping or state synchronization. It popularized declarative rendering, the UI component model, and locality of behavior. We take these things for granted today.

In 2025, React is a complex machine with concurrent rendering, server components, and frameworks, but we can still solidify what made it special by building a tiny version of it ourselves.

# Put something on the screen

Let's start building our version of the library: `Freact`.

<small><i>Note: I'm using the `textContent` property instead of real text nodes for simplicity's sake. Feel free to implement text nodes on your own as an exercise.</i></small>

```ts
function App() {
  return Freact.createElement("h1", { textContent: "Hello world" })
}

Freact.render(document.getElementById("app"), App)
```

Now, we can make this code work.

The `render` method takes in a DOM element and renders our `App` component into it.

Let's start by making an object to hold our module and implementing the `render` method:

```ts
const Freact = {
  // assume our version of a component returns real DOM elements
  render(el: HTMLElement, Component: () => HTMLElement) {
    el.appendChild(Component())
  },
}

function App() {
  return Freact.createElement("h1", { textContent: "Hello world" })
}

Freact.render(document.getElementById("app")!, App)
```

Next, let's implement `createElement` to build the actual DOM nodes. I'm including basic support for HTML properties and children:

```ts
const Freact = {
  render(el: HTMLElement, Component: () => HTMLElement) {
    el.appendChild(Component())
  },
  createElement(
    tag: string,
    props: Record<string, any>,
    children?: Array<HTMLElement | (() => HTMLElement)>
  ) {
    const el = document.createElement(tag)
    Object.assign(el, props)

    if (children) {
      for (const child of children) {
        // supports both elements and other components as children
        el.appendChild(typeof child === "function" ? child() : child)
      }
    }
    return el
  },
}

function App() {
  return Freact.createElement("h1", { textContent: "Hello world" })
}

Freact.render(document.getElementById("app")!, App)
```

At this point, we can see our `App` component on the screen, rendered through our own React implementation!

Not too shabby, but a little boring. Let's add some state and figure out how to update it.

# `useState`

Let's change our `App` component to render a classic counter:

```ts
const Freact = {
  // ...
}

function App() {
  const [count, setCount] = Freact.useState(0)

  return Freact.createElement("div", { style: "display: flex" }, [
    Freact.createElement("button", {
      textContent: "-",
      ariaLabel: "decrement",
      onclick: () => setCount(count - 1),
    }),
    Freact.createElement("h1", { textContent: count }),
    Freact.createElement("button", {
      textContent: "+",
      ariaLabel: "increment",
      onclick: () => setCount(count + 1),
    }),
  ])
}

Freact.render(document.getElementById("app")!, App)
```

Let's think about how `useState` works. At first glance, it is a bit odd, right? Each time our component renders, we're calling `useState` with the same arguments, but it can return different values. We need a way to "remember" and update that value across renders.

We can accomplish this with a bit of internal state and a closure:

```ts
const Freact = {
  // ...
  currentState: undefined,
  useState<T>(initial: T) {
    if (Freact.currentState === undefined) {
      Freact.currentState = initial
    }

    function setState(newValue: T) {
      Freact.currentState = newValue
    }

    return [Freact.currentState as T, setState] as const
  },
}

function App() {
  // ...
}

Freact.render(document.getElementById("app")!, App)
```

There are a couple issues with this implementation, but if you add a `console.log(count)` in our `App` component, we can see the value is updating when using the counter, but the changes are not reflected on the screen.

What gives?

# Re-rendering

In pre-React web apps, new data or user actions would require you to manually updated the impacted HTML...somehow. Often it would lead to holding the necessary dependencies in your head and then updating the UI with a surgical jQuery selector or two. This would start naively, then quickly spiral as your app became a web of connections between state and UI.

In React, you just blow away the UI and recreate it again from the top.

To do so, we need to store references to our root element and component on initial render, then just call our root component again when we want to recreate our UI.

```ts
const Freact = {
  rootElement: undefined,
  rootComponent: undefined,
  render(el: HTMLElement, Component: () => HTMLElement) {
    Freact.rootElement = el
    Freact.rootComponent = Component
    el.appendChild(Component())
  },
  rerender() {
    Freact.rootElement.innerHTML = ""
    Freact.rootElement.appendChild(Freact.rootComponent())
  },
  // ...
}
```

Then we can re-render our app whenever we call `setState`:

```ts
const Freact = {
  // ...
  currentState: undefined,
  useState<T>(initial: T) {
    if (Freact.currentState === undefined) {
      Freact.currentState = initial
    }

    function setState(newValue: T) {
      Freact.currentState = newValue
      Freact.rerender()
    }

    return [Freact.currentState as T, setState] as const
  },
}
// ...
```

The counter works! Our little module can track a piece of state and render some UI based on that state; no bookkeeping required from the developer.

# Using more state

Our current implementation only allows tracking a single `useState` call, not very useful.

Let's support multiple pieces of state by holding an array and an index internally:

```ts
const Freact = {
  // ...
  currentStates: [],
  currentIndex: 0,
  useState<T>(initial: T) {
    const index = Freact.currentIndex

    if (Freact.currentStates[index] === undefined) {
      Freact.currentStates[index] = initial
    }

    function setState(newVal: T) {
      Freact.currentStates[index] = newVal
      Freact.rerender()
    }

    Freact.currentIndex += 1

    return [Freact.currentStates[index] as T, setState] as const
  },
}
// ...
```

Lastly, let's reset our `currentIndex` whenever we re-render:

```ts
const Freact = {
  // ...
  rerender() {
    Freact.currentIndex = 0
    Freact.rootElement.innerHTML = ""
    Freact.rootElement.appendChild(Freact.rootComponent())
  },
  // ...
}
```

It's a trivially simple system yet quite effective, even the real React uses something similar. It's actually the reason you can't call hooks conditionally; a predictable and consistent call order is necessary otherwise indices could get mixed up and one `useState` call could return another's value.

# Fin

We've done it! In only 46 lines, we've got a declarative rendering model that supports tracking states and re-rendering the app to keep the UI up to date.

Thanks for riding along! If you enjoyed the read, subscribe to my newsletter below to keep up with my other writings.

I've created a GitHub repo that includes a runnable example using Vite: https://github.com/austincrim/react-in-50-lines

Here are some further exercises that could be fun:

- implement more hooks like `useEffect` and `useReducer`
- figure out how to make controlled text inputs work
- support more renderable nodes like plain text and numbers
- only re-render dirty subtrees instead of the whole app
- add a JSX transform so we don't have to write `createElement`

And here's the final source for your convenience:

```ts
const Freact = {
  rootElement: undefined as HTMLElement | undefined,
  rootComponent: undefined as (() => HTMLElement) | undefined,
  currentStates: [] as any[],
  currentIndex: 0,
  render(el: HTMLElement, component: () => HTMLElement) {
    Freact.rootElement = el
    Freact.rootComponent = component
    el.appendChild(component())
  },
  rerender() {
    Freact.currentIndex = 0
    Freact.rootElement!.innerHTML = ""
    Freact.rootElement!.appendChild(Freact.rootComponent!())
  },
  createElement(
    tag: string,
    props: Record<string, any>,
    children?: Array<HTMLElement | (() => HTMLElement)>
  ) {
    const el = document.createElement(tag)
    Object.assign(el, props)

    if (children) {
      for (const child of children) {
        el.appendChild(typeof child === "function" ? child() : child)
      }
    }
    return el
  },
  useState<T>(initial: T) {
    const index = Freact.currentIndex

    if (Freact.currentStates[index] === undefined) {
      Freact.currentStates[index] = initial
    }

    function setState(newVal: T) {
      Freact.currentStates[index] = newVal
      Freact.rerender()
    }

    Freact.currentIndex += 1

    return [Freact.currentStates[index] as T, setState] as const
  },
}

function App() {
  const [count, setCount] = Freact.useState(0)

  return Freact.createElement("div", { style: "display: flex" }, [
    Freact.createElement("button", {
      textContent: "-",
      ariaLabel: "decrement",
      onclick: () => setCount(count - 1),
    }),
    Freact.createElement("h1", { textContent: count }),
    Freact.createElement("button", {
      textContent: "+",
      ariaLabel: "increment",
      onclick: () => setCount(count + 1),
    }),
  ])
}

Freact.render(document.getElementById("app")!, App)
```
