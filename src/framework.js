import { setCurrentComponent, clearCurrentComponent } from "./variable.js";
import { setComponentInRegistry, getComponentFromRegistry, setCurrentComponentContext, clearCurrentComponentContext, getCurrentComponentId as getComponentId } from "./utils.js";

// Base Component class that automatically handles ID assignment
export class Component {
  constructor() {
    try {
      this.id = registerComponent(this);
    } catch (error) {
      console.error('Error registering component:', error);
      throw error;
    }
  }

  // Helper method to safely render with automatic data-component-id injection
  safeRender() {
    try {
      const html = this.render();
      return this.injectComponentId(html);
    } catch (error) {
      console.error(`Error rendering component ${this.id}:`, error);
      return `<div data-component-id="${this.id}">Error rendering component</div>`;
    }
  }

  // Automatically inject data-component-id into the root element
  injectComponentId(html) {
    if (!html || typeof html !== 'string') {
      return `<div data-component-id="${this.id}">Invalid render output</div>`;
    }

    // Parse the HTML to find the first element
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<root>${html}</root>`, 'text/html');
    const rootElement = doc.querySelector('root');

    if (!rootElement || !rootElement.firstElementChild) {
      // If no valid element found, wrap in a div
      return `<div data-component-id="${this.id}">${html}</div>`;
    }

    const firstElement = rootElement.firstElementChild;

    // Check if data-component-id already exists
    if (!firstElement.hasAttribute('data-component-id')) {
      firstElement.setAttribute('data-component-id', this.id);
    }

    return firstElement.outerHTML;
  }

  // Default render method (should be overridden)
  render() {
    console.warn(`Component ${this.constructor.name} should implement render() method`);
    return `<div>Component ${this.constructor.name}</div>`;
  }
}

// Reactive system
let routes = [];
let currentComponent = null;
const loadedComponentStyles = new Set();
let componentId = 0;

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

            // Find the closest component element
            const componentElement = currentElement.closest("[data-component-id]");
            if (!componentElement) continue;

            const componentId = componentElement.dataset.componentId;
            const component = getComponent(componentId);
            if (component && typeof component[methodName] === "function") {
              event.preventDefault(); // Prevent default behavior
              event.stopPropagation(); // Stop event bubbling

              // Support both simple method calls and complex parameter calls
              try {
                if (parsedParams.length > 0) {
                  // Pass parsed parameters directly
                  component[methodName]({ event, params: parsedParams });
                } else {
                  // No parameters, just call the method
                  component[methodName]({ event });
                }
              } catch (error) {
                console.error(`Error calling method ${methodName}:`, error);
                // Fallback: pass event and params as object (old behavior)
                component[methodName]({ event, params: parsedParams });
              }
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
  if (!path || typeof path !== 'string') {
    console.warn('Invalid CSS path provided to loadStyle');
    return;
  }

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load CSS: ${response.status} ${response.statusText}`);
    }

    let cssContent = await response.text();

    // Get the component ID from the call stack context
    const componentId = getComponentId();

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
    console.log(`Loaded CSS: ${path}${componentId ? ` (scoped to ${componentId})` : ''}`);
  } catch (error) {
    console.warn(`Failed to load style: ${path}`, error);
  }
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

  // Set the current component context for variable creation
  setCurrentComponent(instance);

  // Store the instance in shared registry
  setComponentInRegistry(id, instance);

  return id;
}

// Auto-register component helper - this will be called automatically
export function createComponent(ComponentClass, ...args) {
  const instance = new ComponentClass(...args);

  // Automatically assign ID if not already set
  if (!instance.id) {
    instance.id = registerComponent(instance);
  }

  return instance;
}

// Update navigateRoute to use safeRender
export function navigateRoute() {
  try {
    const path = window.location.pathname;
    console.log("Navigating to:", path);
    const route = routes.find((route) => route.path === path);

    const root = document.getElementById("root");
    if (!root) {
      console.error("Root element not found");
      return;
    }

    if (currentComponent) {
      root.innerHTML = "";
    }

    if (route) {
      try {
        currentComponent = new route.component();
        clearCurrentComponent();
        // Always use safeRender to ensure data-component-id is injected
        const renderedContent = currentComponent.safeRender();
        root.innerHTML = renderedContent;
      } catch (error) {
        console.error(`Error creating component for route ${path}:`, error);
        root.innerHTML = `<div>Error loading page: ${error.message}</div>`;
      }
    } else {
      console.warn(`No route found for path: ${path}`);
      root.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" style="color: #3b82f6; text-decoration: none;">Go back home</a>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error in navigateRoute:", error);
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `<div>Navigation error: ${error.message}</div>`;
    }
  }
}

// Update updateDOM to use safeRender
export function updateDOM(component) {
  if (!component || !component.id) return;

  const element = document.querySelector(`[data-component-id="${component.id}"]`);
  if (element) {
    // Store active element info before re-render
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && activeElement.tagName === 'INPUT';
    const activeInputId = isInputFocused ? activeElement.id : null;
    const cursorPosition = isInputFocused ? activeElement.selectionStart : null;

    // Create new element using safeRender to ensure data-component-id is injected
    const newHTML = component.safeRender();
    const newElement = document.createRange().createContextualFragment(newHTML).firstElementChild;

    if (newElement) {
      // Replace the element
      element.parentNode.replaceChild(newElement, element);

      // Restore focus and cursor position if there was an active input
      if (activeInputId) {
        const newInput = document.getElementById(activeInputId);
        if (newInput) {
          newInput.focus();
          if (cursorPosition !== null) {
            newInput.setSelectionRange(cursorPosition, cursorPosition);
          }
        }
      }
    }
  } else {
    // If the component element doesn't exist, re-render the entire current component
    if (currentComponent && currentComponent.id === component.id) {
      const root = document.getElementById("root");
      if (root) {
        root.innerHTML = currentComponent.safeRender();
      }
    }
  }
}

export function getComponent(id) {
  return getComponentFromRegistry(id);
}

export function createRoute(path, component) {
  routes.push({ path, component });
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