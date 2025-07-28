import { createVar } from "../../src/variable.js";
import { loadStyle, registerComponent } from "../../src/framework.js";
import { Counter } from "../Counter.js";

export class CounterPage {
  constructor() {
    this.id = registerComponent(this); // Register the instance
    this.counter = new Counter(); // Create an instance of Counter
    loadStyle('./components/CounterPage/counter-page.css'); // Load styles for the CounterPage
  }



  render() {
    return `
      <div data-component-id="${this.id}" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 2rem;">
        <div class="counter-page-container">
          <h1 class="counter-page-title">Counter Page</h1>
          <p class="counter-page-description">
            This page demonstrates the Counter component in action.
          </p>
        
            ${this.counter.render()}
          
        
        </div>
    `;
  }
}