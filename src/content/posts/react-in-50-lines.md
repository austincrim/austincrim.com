---
title: "React from scratch in 50 lines"
lede: Let's make a super basic version of React
datePublished: 2025-08-05
draft: true
---

# React is boring now

React's current ubiquity betrays how innovative it was at the time of its release. Before React, there was mostly targeted DOM manipulation, imperatively updating pieces of the screen and keeping track of the web of connections in your head.

React came along and said, _"What if we just re-render everything all the time?"_. This removed entire classes of frontend problems: no more manual bookkeeping or state synchronization. It also popularized declarative rendering, the UI component model, and colocation of markup and logic.

In 2025, React is a complex machine with concurrent rendering, server components, and frameworks, but let's clarify what made it special by building a tiny version of it ourselves.

# Put something on the screen

Let's start building our version of the library React.

<small><i>Note: I'm using the `textContent` property instead of real text nodes for simplicity's sake. Feel free to implement text nodes on your own as an exercise.</i></small>

```ts
function App() {
  return React.createElement("h1", { textContent: "Hello world" })
}

React.render(document.getElementById("app"), App)
```

Next, let's make this code work.

The `render` method takes in a DOM element and renders our `App` component into it.

Let's start by making an object to hold our module and implementing the `render` method:

```ts
const React = {
  // assume our version of components return real DOM elements
  render(el: HTMLElement, Component: () => HTMLElement) {
    el.appendChild(Component())
  },
}

function App() {
  return React.createElement("h1", { textContent: "Hello world" })
}

React.render(document.getElementById("app")!, App)
```

Next, let's implement `createElement` to build the actual DOM nodes. I'm including basic support for HTML properties and children:

```ts
const React = {
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
  return React.createElement("h1", { textContent: "Hello world" })
}

React.render(document.getElementById("app")!, App)
```

At this point, we can see our `App` component on the screen, rendered through our own React implementation!

Not too shabby, but we can do better. Let's add some state and figure out how to update it.

# `useState`

Let's change our `App` component to render a classic counter:

```ts
const React = {
  // ...
}

function App() {
  const [count, setCount] = React.useState(0)

  return React.createElement("div", { style: "display: flex" }, [
    React.createElement("button", {
      textContent: "-",
      ariaLabel: "decrement",
      onclick: () => setCount(count - 1),
    }),
    React.createElement("h1", { textContent: count }),
    React.createElement("button", {
      textContent: "+",
      ariaLabel: "increment",
      onclick: () => setCount(count + 1),
    }),
  ])
}

React.render(document.getElementById("app")!, App)
```

Let's think about how `useState` works. At first glance, it is a bit odd, right? Each time our component renders, we're calling `useState` with the same arguments, but it can return different values. We need a way to "remember" the current value and update it across renders.

We can accomplish this with a bit of internal state and a closure:

```ts
const React = {
  // ...
  currentState: undefined,
  useState<T>(initial: T) {
    if (React.currentState === undefined) {
      React.currentState = initial
    }

    function setState(newValue: T) {
      React.currentState = newValue
    }

    return [React.currentState as T, setState] as const
  },
}

function App() {
  // ...
}

React.render(document.getElementById("app")!, App)
```

There are a couple issues with this implementation, but if you add a `console.log(count)` in our `App` component, we can see the value is updating when using the counter, but the changes are not reflected on the screen.

What gives?

# Re-rendering

In pre-React web apps, user actions would require you to manually updated the impacted HTML...somehow. Often it would lead to holding the necessary dependencies in your head and then updating the UI with a surgical jQuery selector or two. This would start naively and quickly spiral out of control as your app became a web of implicit connections between state and UI.

In React, you just blow away the UI and recreate it again from the top.

To do so, we need to store references to our root element and component on initial render, then simply call our root component again when we want to recreate our UI afresh.

```ts
const React = {
  rootElement: undefined,
  rootComponent: undefined,
  render(el: HTMLElement, Component: () => HTMLElement) {
    React.rootElement = el
    React.rootComponent = Component
    el.appendChild(Component())
  },
  rerender() {
    React.rootElement.innerHTML = ""
    React.rootElement.appendChild(React.rootComponent())
  },
  // ...
}
```

Then we can re-render our app whenever we call `setState`:

```ts
const React = {
  // ...
  currentState: undefined,
  useState<T>(initial: T) {
    if (React.currentState === undefined) {
      React.currentState = initial
    }

    function setState(newValue: T) {
      React.currentState = newValue
      React.rerender()
    }

    return [React.currentState as T, setState] as const
  },
}
// ...
```

The counter works! Our little module can track a piece of state and render some UI based on that state; no bookkeeping required from the developer.

# Using more state

Our current implementation only allows tracking a single `useState` call, not very useful.

Let's support multiple pieces of state by holding an array and an index internally:

```ts
const React = {
  // ...
  currentStates: [],
  currentIndex: 0,
  useState<T>(initial: T) {
    const index = React.currentIndex

    if (React.currentStates[index] === undefined) {
      React.currentStates[index] = initial
    }

    function setState(newVal: T) {
      React.currentStates[index] = newVal
      React.rerender()
    }

    React.currentIndex += 1

    return [React.currentStates[index] as T, setState] as const
  },
}
// ...
```

Lastly, let's reset our `currentIndex` whenever we re-render:

```ts
const React = {
  // ...
  rerender() {
    React.currentIndex = 0
    React.rootElement.innerHTML = ""
    React.rootElement.appendChild(React.rootComponent())
  },
  // ...
}
```

It's a trivially simple system yet quite effective, even the real React uses something similar. You can begin to see the genesis of the Rules of Hooks. Calling hooks conditionally would mess with our predictable call order, which is necessary lest indices get mixed up and one `useState` call could return another hook's value.

# Fin

We've done it! In only 46 lines, we've got a declarative rendering model that supports tracking states and re-rendering the app to keep the UI up to date.

Thanks for riding along! If you enjoyed the read, subscribe to my newsletter below to keep up with my other writings.

I've created a GitHub repo that includes a runnable example using Vite: https://github.com/austincrim/react-in-50-lines

Here are some further exercises that could be fun:

- implement more hooks like `useEffect` and `useReducer`
- figure out how to make controlled text inputs work
- support more renderable nodes like plain text, numbers, and booleans
- only re-render dirty subtrees instead of the whole app
- add a JSX transform so we don't have to write `createElement`

And here's the final source for your convenience:

```ts
const React = {
  rootElement: undefined as HTMLElement | undefined,
  rootComponent: undefined as (() => HTMLElement) | undefined,
  currentStates: [] as any[],
  currentIndex: 0,
  render(el: HTMLElement, component: () => HTMLElement) {
    React.rootElement = el
    React.rootComponent = component
    el.appendChild(component())
  },
  rerender() {
    React.currentIndex = 0
    React.rootElement!.innerHTML = ""
    React.rootElement!.appendChild(React.rootComponent!())
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
    const index = React.currentIndex

    if (React.currentStates[index] === undefined) {
      React.currentStates[index] = initial
    }

    function setState(newVal: T) {
      React.currentStates[index] = newVal
      React.rerender()
    }

    React.currentIndex += 1

    return [React.currentStates[index] as T, setState] as const
  },
}

function App() {
  const [count, setCount] = React.useState(0)

  return React.createElement("div", { style: "display: flex" }, [
    React.createElement("button", {
      textContent: "-",
      ariaLabel: "decrement",
      onclick: () => setCount(count - 1),
    }),
    React.createElement("h1", { textContent: count }),
    React.createElement("button", {
      textContent: "+",
      ariaLabel: "increment",
      onclick: () => setCount(count + 1),
    }),
  ])
}

React.render(document.getElementById("app")!, App)
```
