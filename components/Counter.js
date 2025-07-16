// Counter.js
import { createVar } from "../src/variable.js";
import { registerComponent } from "../src/framework.js";
export class Counter {
  constructor() {
    [count,setCount] = createVar(0);
    this.id = registerComponent(this); // Register the instance
  }

  increment() {
    this.setCount(this.count() + 1);
  }

  render() {
    return `
      <div data-component-id="${this.id}">
        <p>Count: ${this.count()}</p>
        <button @click="increment">Increment</button>
      </div>
    `;
  }
}