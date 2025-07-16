import { Counter } from "./Counter.js";

export function App() {
    return `
        <div>
            <h1>Welcome to My Framework</h1>
            ${Counter()} <!-- Insert the Counter component here -->
        </div>
    `;
}