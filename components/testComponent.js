// Counter.js
import { registerComponent } from "../src/framework.js";
import { createVar } from "../src/variable.js";
export class testComponent {
  constructor() {
    const [count, setCount] = createVar(0);
    this.count = count;
    this.setCount = setCount;
    this.id = registerComponent(this); // Register the instance
  }

  increment() {
    this.setCount(this.count() + 1);
  }

  render() {
    return `
      <div data-component-id="${this.id}">
        <p>test component</p>
        <button @click="increment">Increment</button>
        <p>Count: ${this.count()}</p>
      </div>
    `;
  }
}