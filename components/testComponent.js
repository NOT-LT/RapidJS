// Counter.js
import { Component } from "../src/framework.js";
import { createVar } from "../src/variable.js";
export class testComponent extends Component {
  constructor() {
    super(); // This automatically assigns this.id
    const [count, setCount] = createVar(0);
    this.count = count;
    this.setCount = setCount;
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