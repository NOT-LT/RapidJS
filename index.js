import { rapid } from "./src/framework.js";
import { Home } from "./components/Home.js";
import { WeatherWidget } from "./components/WeatherWidget/WeatherWidget.js";
import { TodoList } from "./components/ToDoList.js";
import { CounterPage } from "./components/CounterPage/CounterPage.js";
import { Counter } from "./components/Counter.js";
const app = rapid();
app.route('/todo', TodoList);
app.route('/', Home);
app.route('/counter', CounterPage);
app.route('/weather', WeatherWidget);
app.start();

export default app;