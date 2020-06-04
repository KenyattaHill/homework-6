// https://api.openweathermap.org/data/2.5/uvi?lat=37.75&lon=-122.37
const key = '4f7b09b9612d5cab9d797eef0e3e4c02';

const forecast_url = city =>
  `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=imperial`;

const current_weather_url = city =>
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=imperial`;

const uv_index_url = (lat, lon) =>
  `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`;

const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchBtn');
const currentWeatherContainer = document.getElementById('currentData');
const weatherForecastContainer = document.querySelector('.card-deck');
const searchHistoryContainer = document.getElementById('searchHistory');

const getSearchHistory = () => {
  const history = localStorage.getItem('weatherHistory');
  return history === null ? [] : JSON.parse(history);
}

window.addEventListener('load', () => {
  const searchHistory = getSearchHistory();
  renderSearchHistory(searchHistory);
  getWeatherData(searchHistory[0]);
});

searchButton.addEventListener('click', () => {
  getWeatherData();
});
searchInput.addEventListener('keyup', event => {
  if (event.keyCode === 13) getWeatherData();
})


async function getWeatherData(lastSearched) {
  const city = searchInput.value || lastSearched;
  if (!city) return;

  const searchHistory = getSearchHistory();
  if (searchHistory[0] !== city) {
    searchHistory.unshift(city);
    localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
    renderSearchHistory(searchHistory);
  }


  const forecast = await (await fetch(forecast_url(city))).json();
  const currentWeather = await (await fetch(current_weather_url(city))).json();

  const { lon, lat } = currentWeather.coord;

  const uvIndex = await (await fetch(uv_index_url(lat, lon))).json();

  searchInput.value = '';
  renderCurrentWeather(currentWeather, uvIndex.value);
  renderWeatherForecast(forecast);
}

function renderSearchHistory(searchHistory) {
  const html = searchHistory.slice(0, 5).map(city => `<li onclick="getWeatherData('${city}')" class="list-group-item">${city}</li>`).join('');
  searchHistoryContainer.innerHTML = html;
}

function renderWeatherForecast(forecast) {
  const html = forecast.list.filter(weather => new Date(weather.dt_txt).getHours() === 15).map(weather => `
  <div class="card text-white bg-primary">
    <div class="card-body">
      <h5 class="card-title">${new Date(weather.dt_txt).toLocaleDateString()}</h5>
      <img class="w-50" src="http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png">
      <p class="card-text">Temp: ${weather.main.temp} &degF</p>
      <p class="card-text">Humidity: ${weather.main.humidity}%</p>
    </div>
  </div>
  `).join('');
  weatherForecastContainer.innerHTML = html;
}

function renderCurrentWeather(weather, uvIndex) {
  const html = `
            <div class="card-body">
            <div class="card-title">
              <span class="h2">${weather.name} (${new Date(weather.dt * 1000).toLocaleDateString()})</span>
              <img class="d-inline" src="http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png">
            </div>
            <p class="card-text">Temperature: ${weather.main.temp} &degF</p>
            <p class="card-text">Humidity: ${weather.main.humidity}%</p>
            <p class="card-text">Wind Speed: ${weather.wind.speed} MPH</p>
            <p class="card-text">UV Index: <span class="btn btn-danger">${uvIndex}</span></p>
          </div>
  
  `;
  //console.log(weather);
  currentWeatherContainer.innerHTML = html;
  // const titleElement = currentWeatherContainer.querySelector('.h2');
  // titleElement.textContent = `${weather.name} (${new Date(weather.dt * 1000).toLocaleDateString()})`;
}