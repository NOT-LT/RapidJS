import { createVar } from "../src/variable.js";
import { registerComponent, loadStyle } from "../src/framework.js";

export class Counter {
  constructor() {
    const [count, setCount] = createVar(0);
    this.count = count;
    this.setCount = setCount;
    this.id = registerComponent(this); // Register the instance

  }

  increment() {
    this.setCount(this.count() + 1);
    console.log("Incremented count:", this.count());
  }

  decrement() {
    this.setCount(this.count() - 1);
    console.log("Decremented count:", this.count());
  }

  reset() {
    this.setCount(0);
  }

  render() {
    return `
      <div data-component-id="${this.id}" >
        <div class="counter-container">
          <div class="counter-buttons">
            <button class="counter-button counter-button-decrement" @click="decrement()">-</button>
            <button class="counter-button counter-button-increment" @click="increment()">+</button>
            <button class="counter-button counter-button-reset" @click="reset">Reset</button>
          </div>
          <p class="counter-display">Count: ${this.count()}</p>
        </div>
      </div>
    `;
  }
}