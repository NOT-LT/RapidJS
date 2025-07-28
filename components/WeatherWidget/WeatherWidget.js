import { useState } from "../../src/variable.js";
import { Component, loadStyle } from "../../src/framework.js";
import { Toast } from "../Toast/Toast.js";

export class WeatherWidget extends Component {
  constructor() {
    super(); // This automatically assigns this.id and sets context

    // Now createVar will automatically link to this component
    useState({
      weather: null,
      loading: false,
      city: "Bahrain",
      error: null
    });

    // const [weather, setWeather] = createVar(null);
    // const [loading, setLoading] = createVar(false);
    // const [city, setCity] = createVar("Bahrain");
    // const [error, setError] = createVar(null);

    // this.weather = weather;
    // this.setWeather = setWeather;
    // this.loading = loading;
    // this.setLoading = setLoading;
    // this.city = city;
    // this.setCity = setCity;
    // this.error = error;
    // this.setError = setError;

    // Load styles - corrected path
    loadStyle('./components/WeatherWidget/weather-widget.css');

    // Load initial weather
    this.fetchWeather();
  }

  async fetchWeather() {
    this.setLoading(true);
    this.setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${this.city()}&appid=38aba9aa2b486f427bdbd9f0cfe04bb2&units=metric`
      );

      if (response.ok) {
        const data = await response.json();
        this.setWeather(data);
        // Show success toast
        Toast.success(`Weather data for ${data.name} updated successfully!`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        this.setError(errorMessage);
        // Show error toast
        Toast.error(`Failed to fetch weather: ${errorMessage}`);
      }
    } catch (err) {
      const errorMessage = "Failed to fetch weather data. Please check your internet connection.";
      this.setError(errorMessage);
      // Show error toast
      Toast.error(errorMessage);
    } finally {
      this.setLoading(false);
    }
  }

  refreshWeather({ event, params }) {
    // Get the current city from input if user typed something new
    const cityInput = document.getElementById('cityInput');
    if (cityInput && cityInput.value.trim()) {
      this.setCity(cityInput.value.trim());
    }

    this.fetchWeather();

  }

  handleKeyPress({ event, params }) {
    if (event.key === 'Enter') {
      // Get the current city from input
      const cityInput = event.target;
      if (cityInput && cityInput.value.trim()) {
        this.setCity(cityInput.value.trim());
      }

      this.fetchWeather();
    }
  }

  getWeatherIcon(iconCode) {
    const icons = {
      '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return icons[iconCode] || '🌤️';
  }

  render() {
    return `
      <div data-component-id="${this.id}" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 2rem 0;">
        <div class="weather-widget">
          <div class="weather-header">
            <h3 class="weather-title">🌤️ Weather Widget</h3>
            <button class="weather-refresh" @click="refreshWeather()" ${this.loading() ? 'disabled' : ''}>
              <span class="refresh-icon">${this.loading() ? '🔄' : '↻'}</span>
            </button>
          </div>
          
          <div class="weather-search">
            <input 
              type="text" 
              class="weather-input"
              id="cityInput"
              value="${this.city()}"
              placeholder="Enter city name..."
              @keypress="handleKeyPress"
            >
            <button class="weather-search-btn" @click="refreshWeather()">Search</button>
          </div>

          ${this.loading() ? `
            <div class="weather-loading">
              <div class="spinner"></div>
              <p>Loading weather data...</p>
            </div>
          ` : ''}

          ${this.weather() && !this.loading() && !this.error() ? `
            <div class="weather-info">
              <div class="weather-main">
                <div class="weather-icon">${this.getWeatherIcon(this.weather().weather[0].icon)}</div>
                <div class="weather-temp">${Math.round(this.weather().main.temp)}°C</div>
                <div class="weather-city">${this.weather().name}</div>
              </div>
              
              <div class="weather-details">
                <div class="weather-detail">
                  <span class="detail-label">Condition:</span>
                  <span class="detail-value">${this.weather().weather[0].description}</span>
                </div>
                <div class="weather-detail">
                  <span class="detail-label">Humidity:</span>
                  <span class="detail-value">${this.weather().main.humidity}%</span>
                </div>
                <div class="weather-detail">
                  <span class="detail-label">Wind:</span>
                  <span class="detail-value">${this.weather().wind.speed} m/s</span>
                </div>
                <div class="weather-detail">
                  <span class="detail-label">Feels like:</span>
                  <span class="detail-value">${Math.round(this.weather().main.feels_like)}°C</span>
                </div>
              </div>
            </div>
          ` : ''}

          ${this.error() && !this.loading() ? `
            <div class="weather-info">
              <div class="weather-main">
                <div class="weather-icon">🌫️</div>
                <div class="weather-temp">--°C</div>
                <div class="weather-city">Unable to load weather</div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}