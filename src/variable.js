import { getCurrentComponentContext, getComponentFromRegistry, updateComponentDOM, setCurrentComponentContext, clearCurrentComponentContext } from "./utils.js";

class Variable {
  constructor(value, shouldUpdateDOM = true) {
    this.value = value;
    this.subscribers = new Set();
    this.componentId = null;
    this.shouldUpdateDOM = shouldUpdateDOM;
  }

  get() {
    return this.value;
  }

  set(newValue) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.subscribers.forEach((cb) => cb(this.value));

      if (this.shouldUpdateDOM && this.componentId) {
        const component = getComponentFromRegistry(this.componentId);
        if (component) {
          updateComponentDOM(component);
        }
      }
    }
  }

  setComponentId(componentId) {
    this.componentId = componentId;
  }
}

export function setCurrentComponent(component) {
  setCurrentComponentContext(component);
}

export function clearCurrentComponent() {
  clearCurrentComponentContext();
}

// Method 1: useState - Creates reactive state that triggers DOM updates
export function useState(initialState = {}) {
  const currentComponent = getCurrentComponentContext();
  if (!currentComponent) {
    console.warn('useState called outside of component constructor');
    return;
  }

  Object.entries(initialState).forEach(([key, initialValue]) => {
    const variable = new Variable(initialValue, true); // shouldUpdateDOM = true
    variable.setComponentId(currentComponent.id);

    const getter = function (id) {
      if (id) {
        queueMicrotask(() => {
          const element = document.getElementById(id);
          if (element && !element.dataset.hasListener) {
            element.addEventListener("input", (e) => variable.set(e.target.value));
            element.dataset.hasListener = "true";
          }
        });
      }
      return variable.get();
    };

    const setter = function (newValue) {
      variable.set(newValue);
    };

    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    currentComponent[key] = getter;
    currentComponent[`set${capitalizedKey}`] = setter;
  });
}

// Method 2: useRef - Creates non-reactive refs that DON'T trigger DOM updates
export function useRef(initialRefs = {}) {
  const currentComponent = getCurrentComponentContext();
  if (!currentComponent) {
    console.warn('useRef called outside of component constructor');
    return;
  }

  Object.entries(initialRefs).forEach(([key, initialValue]) => {
    const variable = new Variable(initialValue, false); // shouldUpdateDOM = false
    variable.setComponentId(currentComponent.id);

    const getter = function (id) {
      if (id) {
        queueMicrotask(() => {
          const element = document.getElementById(id);
          if (element && !element.dataset.hasListener) {
            element.addEventListener("input", (e) => variable.set(e.target.value));
            element.dataset.hasListener = "true";
          }
        });
      }
      return variable.get();
    };

    const setter = function (newValue) {
      variable.set(newValue);
    };

    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    currentComponent[key] = getter;
    currentComponent[`set${capitalizedKey}`] = setter;
  });
}

// Keep the old createReactiveProps for backward compatibility
export const createReactiveProps = useState;

// Keep the old createVar for backward compatibility
export const createVar = (initialValue) => {
  const variable = new Variable(initialValue, true);

  if (currentComponent) {
    variable.setComponentId(currentComponent.id);
  }

  function value(id) {
    if (id) {
      queueMicrotask(() => {
        const element = document.getElementById(id);
        if (element && !element.dataset.hasListener) {
          element.addEventListener("input", (e) => variable.set(e.target.value));
          element.dataset.hasListener = "true";
        }
      });
    }
    return variable.get();
  }

  function setValue(newValue) {
    variable.set(newValue);
  }

  return [value, setValue];
};

let effectCallback = null;

export const createEffect = (callback) => {
  effectCallback = callback;
  callback();
  effectCallback = null;
};