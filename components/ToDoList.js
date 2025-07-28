import { createVar } from "../src/variable.js";
import { registerComponent, loadStyle } from "../src/framework.js";

export class TodoList {
  constructor() {
    const [todos, setTodos] = createVar([]);
    const [newTask, setNewTask] = createVar("");
    this.newTask = newTask;
    this.setNewTask = setNewTask;
    this.todos = todos;
    this.setTodos = setTodos;
    this.id = registerComponent(this); // Register the instance

    // Load styles
    loadStyle('./style.css');
  }

  addTodo() {
    console.log("Adding new task:", this.newTask());
    if (this.newTask().trim()) {
      this.setTodos([...this.todos(), this.newTask().trim()]);
      this.setNewTask("");
    }
  }
  // Note, when using a string as the parameter, use single quotes, not double quotes.
  removeTodo({ event, params }) { // These parameters are automatically passed by the framework. The event is the js event, and params is an array of the parameters passed in the @click directive.
    const [index] = params;
    console.log('Event:', event);
    console.log('Removing todo at index:', index);
    this.setTodos(this.todos().filter((_, i) => i !== index));
  }
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.addTodo();
    }
  }

  render() {
    return `
      <div data-component-id="${this.id}" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 2rem;">
        <div class="todo-container">
          <h3 class="todo-title">Todo List</h3>
          
          <div class="todo-input-container">
            <input 
              type="text" 
              class="todo-input"
              id="taskInput"
              value="${this.newTask("taskInput")}"
              placeholder="Add a new task..."
              @keypress="handleKeyPress"
            >
            <button class="todo-add-button" @click="addTodo">Add Task</button>
          </div>

          <ul class="todo-list">
            ${this.todos().map((todo, index) => `
              <li class="todo-item"">
                <span class="todo-text">${todo}</span>
                <button class="todo-remove-button" @click="removeTodo(${index})">Remove</button>
              </li>
            `).join("")}
          </ul>
          
          ${this.todos().length === 0 ? `
            <div style="text-align: center; color: #9ca3af; margin-top: 2rem;">
              <p>No tasks yet. Add one above! ✨</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}