import { useState } from "../../src/variable.js";
import { Component } from "../../src/framework.js";

export class CounterPage extends Component {
  constructor() {
    super(); // This automatically assigns this.id
    useState({ count: 0 });
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
      <div>
        <link rel="stylesheet" href="./components/style.css">
        <div style="min-height: 100vh; display: flex; justify-content: center; align-items: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
          <div class="counter-container">
            <h2 style="text-align: center; color: #f3f4f6; margin-bottom: 2rem; font-size: 2rem;">Counter Page</h2>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem;">
              <button class="counter-button" @click="decrement" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">-</button>
              <button class="counter-button" @click="increment">+</button>
              <button class="counter-button" @click="reset" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">Reset</button>
            </div>
            <p class="counter-display">Count: ${this.count()}</p>
          </div>
        </div>
      </div>
    `;
  }
}