
// import { createRoute, navigateRoute } from "./router.js";

// window.addEventListener('popstate', navigateRoute);
// window.addEventListener('load', navigateRoute);
// if (window.location.hash) {
//   history.replaceState(null, '', window.location.pathname + window.location.search);
// }

export function rapid() {
  return {
    route,
    navigateTo,
    start
  }
}
function route(path, component) {
  createRoute(path, component);
}
function navigateTo(path) {
  history.pushState(null, '', path);
  navigateRoute();
}
function start() {
  navigateRoute();
}

// Reactive system
let routes = [];
let currentComponent = null;
const componentRegistry = new Map();
let componentId = 0;

export function registerComponent(instance) {
  const id = `component-${componentId++}`;
  componentRegistry.set(id, instance);
  return id;
}

export function getComponent(id) {
  return componentRegistry.get(id);
}

export function createRoute(path, component) {
  routes.push({ path, component });
}

export function navigateRoute() {
  const path = window.location.pathname;
  const route = routes.find((route) => route.path === path);
  const root = document.getElementById("root");

  if (currentComponent) {
    // Cleanup previous component if needed
    root.innerHTML = "";
  }

  if (route) {
    currentComponent = new route.component();
    root.innerHTML = currentComponent.render();
  } else {
    root.innerHTML = "404 - Not Found";
  }
}

const events = [
  "click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout",
  "keydown", "keyup", "input", "change", "submit", "focus", "blur",
];

events.forEach((eventType) => {
  document.addEventListener(eventType, (event) => {
    const targetElement = event.target;

    // Loop through all attributes of the element
    for (const attr of targetElement.attributes) {
      if (attr.name.startsWith("@")) {
        const attrEvent = attr.name.slice(1); // Remove '@' (e.g., @click → click)
        if (attrEvent !== eventType) continue; // Only trigger for matching events

        const methodName = attr.value.trim(); // Extract the method name (e.g., "handleClick")

        // Find the closest component element
        const componentElement = targetElement.closest("[data-component-id]");
        if (!componentElement) return;



        const componentId = componentElement.dataset.componentId;
        const component = getComponent(componentId);
        if (component && typeof component[methodName] === "function") {
          component[methodName](event); // Call the method
        }
      }
    }
  });
});

export function updateDOM(component) {
  const element = document.querySelector(`[data-component-id="${component.id}"]`);
  if (element) {
    const newElement = document.createRange().createContextualFragment(component.render()).firstElementChild;
    if (newElement) {
      element.parentNode.replaceChild(newElement, element);
    }
  }

}