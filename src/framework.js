// Reactive system
let routes = [];
let currentComponent = null;
const componentRegistry = new Map();
let componentId = 0;
const loadedComponentStyles = new Set();

window.addEventListener('popstate', navigateRoute);

// Move helper functions outside the event listener
function parseParameters(paramString) {
  if (!paramString) return [];

  const params = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let depth = 0;

  for (let i = 0; i < paramString.length; i++) {
    const char = paramString[i];

    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (char === stringChar && inString) {
      inString = false;
      stringChar = '';
      current += char;
    } else if (!inString && (char === '{' || char === '[')) {
      depth++;
      current += char;
    } else if (!inString && (char === '}' || char === ']')) {
      depth--;
      current += char;
    } else if (!inString && char === ',' && depth === 0) {
      params.push(parseValue(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    params.push(parseValue(current.trim()));
  }

  return params;
}

function parseValue(value) {
  // Handle empty or whitespace
  if (!value || !value.trim()) return value;

  value = value.trim();

  // Handle strings (both single and double quotes)
  if ((value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1); // Remove quotes
  }

  // Handle null
  if (value === 'null') return null;

  // Handle undefined
  if (value === 'undefined') return undefined;

  // Handle booleans
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Handle numbers
  if (!isNaN(value) && !isNaN(parseFloat(value))) {
    return parseFloat(value);
  }

  // Handle objects and arrays
  if ((value.startsWith('{') && value.endsWith('}')) ||
    (value.startsWith('[') && value.endsWith(']'))) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn('Failed to parse JSON:', value);
      return value; // Return as string if JSON parsing fails
    }
  }

  // Handle functions (basic function detection)
  if (value.includes('=>') || value.startsWith('function')) {
    try {
      return new Function('return ' + value)();
    } catch (e) {
      console.warn('Failed to parse function:', value);
      return value; // Return as string if function parsing fails
    }
  }

  // Return as-is (likely a variable name or raw string)
  return value;
}

const events = [
  "click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout",
  "keydown", "keyup", "input", "change", "submit", "focus", "blur",
];

events.forEach((eventType) => {
  document.addEventListener(eventType, (event) => {
    const targetElement = event.target;

    // Look for the element with the @ attribute, starting from the target and going up
    let currentElement = targetElement;
    while (currentElement) {
      if (currentElement.attributes) {
        for (const attr of currentElement.attributes) {
          if (attr.name.startsWith("@")) {
            const attrEvent = attr.name.slice(1); // Remove '@' (e.g., @click → click)
            if (attrEvent !== eventType) continue; // Only trigger for matching events

            const methodName = attr.value.trim().split('(')[0]; // Get the method name before any parameters
            const methodParams = attr.value.trim().split('(')[1]?.replace(')', '').trim();
            let parsedParams = [];

            if (methodParams) {
              // Use a more sophisticated parameter parsing approach
              parsedParams = parseParameters(methodParams);
            }

            console.log("Parsed Parameters:", parsedParams);

            // Find the closest component element
            const componentElement = currentElement.closest("[data-component-id]");
            if (!componentElement) continue;

            const componentId = componentElement.dataset.componentId;
            const component = getComponent(componentId);
            if (component && typeof component[methodName] === "function") {
              event.preventDefault(); // Prevent default behavior
              event.stopPropagation(); // Stop event bubbling
              // Pass as an object with event and params
              component[methodName]({ event, params: parsedParams });
              return; // Exit after handling the event
            }
          }
        }
      }
      currentElement = currentElement.parentElement;
    }
  });
});

// Simple style loader function
export async function loadStyle(path) {
  try {
    const response = await fetch(path);
    let cssContent = await response.text();

    // Get the component ID from the call stack context
    const componentId = getCurrentComponentId();

    // Create a unique key for scoped styles
    const styleKey = componentId ? `${path}-${componentId}` : path;

    // Check if already loaded for this component
    if (loadedComponentStyles.has(styleKey)) {
      return;
    }

    // If componentId is available, scope the CSS
    if (componentId) {
      cssContent = scopeCSS(cssContent, componentId);
    }

    const style = document.createElement('style');
    style.setAttribute('data-style-path', path);
    style.setAttribute('data-component-id', componentId || 'global');
    style.textContent = cssContent;
    document.head.appendChild(style);

    loadedComponentStyles.add(styleKey);
  } catch (error) {
    console.warn(`Failed to load style: ${path}`, error);
  }
}

// Helper function to get the current component ID
function getCurrentComponentId() {
  // Try to find the component that's currently being constructed
  const error = new Error();
  const stack = error.stack;

  // Look through the component registry to find which component is being initialized
  for (const [id, component] of componentRegistry.entries()) {
    if (component && component.constructor && stack.includes(component.constructor.name)) {
      return id;
    }
  }

  return null;
}

function scopeCSS(cssContent, componentId) {
  // Add component-specific scoping to each CSS rule
  return cssContent.replace(
    /([^{}]+)\s*\{/g,
    (match, selector) => {
      // Skip @media, @keyframes, etc.
      if (selector.trim().startsWith('@')) {
        return match;
      }

      // Skip already scoped selectors
      if (selector.includes('[data-component-id=')) {
        return match;
      }

      // Scope the selector to the component
      const scopedSelector = selector
        .split(',')
        .map(s => `[data-component-id="${componentId}"] ${s.trim()}`)
        .join(', ');

      return `${scopedSelector} {`;
    }
  );
}

// Update registerComponent to track during construction
export function registerComponent(instance) {
  const id = `component-${componentId++}`;

  // Store the instance immediately for getCurrentComponentId to find it
  componentRegistry.set(id, instance);

  return id;
}

// ... rest of existing code remains the same ...
export function getComponent(id) {
  return componentRegistry.get(id);
}

export function createRoute(path, component) {
  routes.push({ path, component });
}

export function navigateRoute() {
  const path = window.location.pathname;
  console.log("Navigating to:", path);
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
    console.error(`No route found for path: ${path}`);
    root.innerHTML = "404 - Not Found";
  }
}

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

// Clean up hash if present
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

export function updateDOM(component) {
  if (!component || !component.id) return;

  const element = document.querySelector(`[data-component-id="${component.id}"]`);
  if (element) {
    const newElement = document.createRange().createContextualFragment(component.render()).firstElementChild;
    if (newElement) {
      element.parentNode.replaceChild(newElement, element);
    }
  } else {
    // If the component element doesn't exist, re-render the entire current component
    if (currentComponent && currentComponent.id === component.id) {
      const root = document.getElementById("root");
      if (root) {
        root.innerHTML = currentComponent.render();
      }
    }
  }
}