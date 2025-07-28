import { useState, useRef } from "../src/variable.js";
import { Component, loadStyle } from "../src/framework.js";

export class TodoList extends Component {
  constructor() {
    super(); // This automatically assigns this.id
    useState({ todos: [] });        // Will trigger DOM re-render when changed
    useState({ newTask: "" });      // Won't trigger DOM re-render when changed
    loadStyle('./style.css');
  }

  addTodo() {
    console.log("Adding new task:", this.newTask());
    if (this.newTask().trim()) {
      this.setTodos([...this.todos(), this.newTask().trim()]); // Triggers DOM update
      this.setNewTask(""); // Doesn't trigger DOM update, but clears the input

    }
  }

  removeTodo({ event, params }) {
    console.log("Params:", params);
    const index = params[0];
    console.log('Removing todo at index:', index);
    this.setTodos(this.todos().filter((_, i) => i !== index)); // Triggers DOM update
  }

  handleKeyPress({ event, params }) {
    if (event.key === 'Enter') {
      this.addTodo();
    }
  }

  render() {
    return `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 2rem;">
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
              <li class="todo-item">
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