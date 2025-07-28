import { registerComponent } from "../src/framework.js";
import { Counter } from "./Counter.js";
import rapid from "../index.js";

export class Home {
  constructor() {
    this.id = registerComponent(this); // Register the instance
    this.Counter = new Counter(); // Create an instance of Counter
  }

  navigateToTodo() {
    console.log("Navigating to Todo List");
    rapid.navigateTo('/todo');
  }

  navigateToCounter() {
    rapid.navigateTo('/counter');
  }

  navigateToWeather() {
    rapid.navigateTo('/weather');
  }

  render() {
    return `
    <div data-component-id="${this.id}">
     
      <div class="home-container">
        <main class="home-main">
          <div class="framework-badge">
            🚀 RapidJS Framework
          </div>
          
          <h1 class="home-title">
            Welcome to RapidJS
          </h1>

          <p class="home-description">
            A lightweight, reactive front-end framework for JavaScript.<br />
            Experience the power of reactive state management.
          </p>

          <div class="counter-showcase">
            <h3 class="showcase-title">Interactive Counter Component</h3>
            ${this.Counter.render()}
          </div>
        </main>

        <footer class="home-footer">
          <div class="footer-content">
            <h3 class="footer-title">Explore More Components</h3>
            <div class="footer-links">
             <button class="footer-link" @click="navigateToTodo">
                <span>📝</span>
                <span>Todo List</span>
              </button>
              <button class="footer-link" @click="navigateToCounter">
                <span>🔢</span>
                <span>Counter Page</span>
              </button>
              <button class="footer-link" @click="navigateToWeather">
                <span>🌤️</span>
                <span>Weather Widget</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
    `;
  }
}