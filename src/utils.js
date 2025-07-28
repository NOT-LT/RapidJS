// Utility functions to break circular dependencies

let currentComponent = null;
const componentRegistry = new Map();

export function setCurrentComponentContext(component) {
    currentComponent = component;
}

export function getCurrentComponentContext() {
    return currentComponent;
}

export function clearCurrentComponentContext() {
    currentComponent = null;
}

export function getComponentFromRegistry(id) {
    return componentRegistry.get(id);
}

export function setComponentInRegistry(id, component) {
    componentRegistry.set(id, component);
}

export function getAllComponentsFromRegistry() {
    return componentRegistry;
}

export function getCurrentComponentId() {
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

export function updateComponentDOM(component) {
    // This will be called from variable.js to update DOM
    // We'll import and call the updateDOM function dynamically to avoid circular dependency
    import("./framework.js").then(({ updateDOM }) => {
        updateDOM(component);
    });
}
