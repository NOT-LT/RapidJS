import { rapid } from "./src/framework.js";
import { Home } from "./app/Pages/HomePage/Home.js";
import { WeatherWidget } from "./app/Components/WeatherWidget/WeatherWidget.js";
import { TodoList } from "./app/Components/ToDoList.js";
import { CounterPage } from "./app/Pages/CounterPage/CounterPage.js";

const app = rapid();
app.route('/todo', TodoList);
app.route('/', Home);
app.route('/counter', CounterPage);
app.route('/weather', WeatherWidget);

app.start();

export default app;