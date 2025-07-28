import { Component } from "../../../src/framework.js";
import { Counter } from "../../Components/Counter.js";
import rapid from "../../../index.js";

export class Home extends Component {
  constructor() {
    super(); // This automatically assigns this.id
    this.Counter = new Counter();
  }

  navigateToTodo() {
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
    <div>
      <link rel="stylesheet" href="./components/style.css">
      
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
            ${this.Counter.safeRender()}
          </div>
        </main>

        <footer class="home-footer">
          <div class="footer-content">
            <h3 class="footer-title">Explore More Components</h3>
            <div class="footer-links">
              <div class="footer-link" @click="navigateToTodo">
                <span>📝</span>
                <span>Todo List</span>
              </div>
              <div class="footer-link" @click="navigateToCounter">
                <span>🔢</span>
                <span>Counter Page</span>
              </div>
              <div class="footer-link" @click="navigateToWeather">
                <span>🌤️</span>
                <span>Weather Widget</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    `;
  }
}