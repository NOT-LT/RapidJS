import { createVar } from "../src/variable.js";
import { registerComponent } from "../src/framework.js";

export class TodoList {
  constructor() {
    const [todos, setTodos] = createVar([]);
    const [newTask, setNewTask] = createVar("");
    this.newTask = newTask;
    this.setNewTask = setNewTask;
    this.todos = todos;
    this.setTodos = setTodos;
    this.id = registerComponent(this); // Register the instance
  }

  addTodo() {
    console.log("newTask:", this.newTask());
    this.setTodos([...this.todos(), this.newTask()]);
    this.setNewTask("");
  }

  removeTodo(event) {
    // Find the closest list item
    const li = event.target.closest("li");
    if (!li) return;

    // Get the index from the dataset
    const index = parseInt(li.dataset.index, 10);
    if (isNaN(index)) return;

    // Remove the todo item
    this.setTodos(this.todos().filter((_, i) => i !== index));
  }

  updateNewTask() {
    const input = document.querySelector(`[data-component-id="${this.id}"] input`);
    this.setNewTask(input.value);
  }
  render() {
    return `
      <div data-component-id="${this.id}">
        <h3>Todo List</h3>
        <input type="text" id="inx" value="${this.newTask("inx")}"  placeholder="New task">
        <button @click="addTodo">Add</button>
        <ul>
          ${this.todos().map((todo, index) => `
            <li data-index="${index}">
              ${todo} <button @click="removeTodo">❌</button>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }
}
