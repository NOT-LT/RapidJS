import { updateDOM } from "./framework.js";

class Variable {
  constructor(value) {
    this.value = value;
    this.subscribers = new Set();
  }

  get() {
    return this.value;
  }

  set(newValue) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.subscribers.forEach((cb) => cb(this.value));
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
  }
}

export const createVar = (initialValue) => {
  const variable = new Variable(initialValue);

  function value(id) {
    if (effectCallback) variable.subscribe(effectCallback);

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

  function setValue(newValue, render = true) {
    variable.set(newValue);
    if (render) updateDOM(this);
  };

  return [value, setValue];
};

let effectCallback = null;

export const createEffect = (callback) => {
  effectCallback = callback;
  callback();
  effectCallback = null;
};
