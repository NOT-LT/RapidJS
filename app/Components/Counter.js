import { useState } from "../../src/variable.js";
import { Component } from "../../src/framework.js";

export class Counter extends Component {
  constructor() {
    super(); // This automatically assigns this.id and sets up Component features
    useState({ count: 0 });
  }

  increment() {
    this.setCount(this.count() + 1);
  }

  decrement() {
    this.setCount(this.count() - 1);
  }

  reset() {
    this.setCount(0);
  }

  render() {
    return `
      <div class="counter-container">
        <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem;">
          <button class="counter-button" @click="decrement" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">-</button>
          <button class="counter-button" @click="increment">+</button>
          <button class="counter-button" @click="reset" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">Reset</button>
        </div>
        <p class="counter-display">Count: ${this.count()}</p>
      </div>
    `;
  }
}