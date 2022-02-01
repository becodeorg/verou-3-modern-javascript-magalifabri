// IMPORTS

import { daysOfTheWeek } from "./index.js";


// GLOBAL VARIABLES

const currentWeatherDOMElems = {
    summaryP: document.querySelector(".summary"),
    
    bigWeatherIcon: document.querySelector(".big-weather-icon"),
    bigTemperatureNumber: document.querySelector(".big-temperature-number"),
    
    precipitationLi: document.querySelector(".data-list .precipitation .number"),
    windLi: document.querySelector(".data-list .wind .number"),
    windDirectionLi: document.querySelector(".data-list .wind-direction .arrow"),
    
    temperatureChart: document.querySelector(".chart.temperature"),
    precipitationChart: document.querySelector(".chart.precipitation"),

    temperatureChartButton: document.querySelector(".temperature-chart-button"),
    precipitationChartButton: document.querySelector(".precipitation-chart-button"),
}


// FUNCTIONS

const switchCharts = (event) => {
    currentWeatherDOMElems.temperatureChart.classList.remove("hidden");
    currentWeatherDOMElems.precipitationChart.classList.remove("hidden");

    currentWeatherDOMElems.temperatureChartButton.classList.remove("hidden");
    currentWeatherDOMElems.precipitationChartButton.classList.remove("hidden");

    if (event.target.classList[0].includes("temperature")) {
        currentWeatherDOMElems.precipitationChart.classList.add("hidden");
        currentWeatherDOMElems.precipitationChartButton.classList.add("hidden");
    } else {
        currentWeatherDOMElems.temperatureChart.classList.add("hidden");
        currentWeatherDOMElems.temperatureChartButton.classList.add("hidden");
    }
}


// END fillPrecipitationChart HELPER FUNCTIONS

const createNewPrecipitationChartJsObj = (dataObj) => {
    currentWeatherDOMElems.precipitationChart.chartInstance = new Chart(currentWeatherDOMElems.precipitationChart, {
        plugins: [ChartDataLabels],
        type: 'bar',
        data: {
            labels: dataObj.timestamps,
            datasets: [{
                barPercentage: 1.0, // no gap between bars
                categoryPercentage: 1.0, // ^
                data: dataObj.precipitationData,
                backgroundColor: "rgba(255, 255, 255, .3)",
                
                datalabels: {
                    anchor: "end",
                    align: "top",
                    padding: {
                        left: 5,
                        right: 5,
                        top: 5,
                    },
                    display: "auto",
                    formatter: value => value > 0 ? value + "%" : "",
                }
            }]
        },
        options: { scales: { y: { ticks: { display: false} } } }
    });
}


const selectDataForPrecipitationChart = (weatherData) => {
    const dataObj = {
        precipitationData: [],
        timestamps: [],
    };
    
    for (let i = 0; i < 12; i++) {
        dataObj.precipitationData.push(Math.round(weatherData.hourly[i].pop * 100));
        dataObj.timestamps.push(new Date(weatherData.hourly[i].dt * 1000).getHours() + "h");
    }

    return (dataObj);
}

// fillPrecipitationChart HELPER FUNCTIONS


const fillPrecipitationChart = (weatherData) => {
    destroyOldChart(currentWeatherDOMElems.precipitationChart.chartInstance);
    const dataObj = selectDataForPrecipitationChart(weatherData);
    createNewPrecipitationChartJsObj(dataObj);
}


// END fillTemperatureChart HELPER FUNCTIONS

const createNewTemperatureChartJsObj = (dataObj) => {
    currentWeatherDOMElems.temperatureChart.chartInstance = new Chart(currentWeatherDOMElems.temperatureChart, {
        plugins: [ChartDataLabels],
        type: 'line',
        data: {
            labels: dataObj.timestamps,
            datasets: [{
                data: dataObj.temperatureData,
                pointRadius: 0, // hide dots on line
                borderColor: "white",
                borderWidth: 2,
                fill: true,
                backgroundColor: "transparent",
                tension: 0.3, // make line more curvy
                
                datalabels: {
                    align: "top",
                    padding: {
                        left: 20,
                        bottom: 10,
                        right: 20,
                    },
                    display: "auto",
                    formatter: value => value + "°",
                }
            }]
        },
        options: { scales: { y: { ticks: { display: false} } } }
    });
}


const selectDataForTemperatureChart = (weatherData) => {
    const dataObj = {
        temperatureData: [],
        timestamps: [],
    };
    
    for (let i = 0; i < 12; i++) {
        dataObj.temperatureData.push(Math.round(weatherData.hourly[i].temp));
        dataObj.timestamps.push(new Date(weatherData.hourly[i].dt * 1000).getHours() + "h");
    }

    return (dataObj);
}


const destroyOldChart = (chart) => {
    if (chart) {
        chart.destroy();
    }
}


const setGlobalChartJsOptions = () => {
    Chart.defaults.font.size = 16;
    Chart.defaults.color = "white";
    Chart.defaults.font.family = "Dosis";
    Chart.defaults.plugins.tooltip.enabled = false;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.scale.beginAtZero = true;
    Chart.defaults.scale.grid.display = false;
    Chart.defaults.scale.grid.drawBorder = false;
    Chart.defaults.scale.ticks.maxRotation = 0;
    Chart.defaults.scale.ticks.maxTicksLimit = 6;
    Chart.defaults.layout.padding = {top: 30, right: 10, left: 10};
    Chart.defaults.hover.mode = null;
;}

// fillTemperatureChart HELPER FUNCTIONS


const fillTemperatureChart = (weatherData) => {
    setGlobalChartJsOptions();
    destroyOldChart(currentWeatherDOMElems.temperatureChart.chartInstance);
    const dataObj = selectDataForTemperatureChart(weatherData)
    createNewTemperatureChartJsObj(dataObj);
}


const fillMainDataDiv = (data) => {
    currentWeatherDOMElems.bigWeatherIcon.setAttribute("src", `./images/weather-icons/${data.iconName}.png`);
    currentWeatherDOMElems.bigWeatherIcon.setAttribute("alt", "icon of " + data.description);
    
    currentWeatherDOMElems.bigTemperatureNumber.innerHTML = `${Math.round(data.temperature)}<sup>°</sup>`

    currentWeatherDOMElems.precipitationLi.textContent = data.precip | "0";
    currentWeatherDOMElems.windLi.textContent = Math.round(data["wind-speed"] * 3.6);
    currentWeatherDOMElems.windDirectionLi.style.transform = `rotate(${-90 + (Math.abs(data["wind-direction"] - 180))}deg)`;
}


const fillSummaryP = (data) => {
    const day = daysOfTheWeek[data.dateObject.getDay()];
    const hours = data.dateObject.getHours();
    let minutes = data.dateObject.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    const description = data.description;
    
    currentWeatherDOMElems.summaryP.textContent = `${day} ${hours}:${minutes}, ${description}`;
}


export const createCurrentWeatherDiv = (currentWeatherData, allWeatherData) => {
    fillSummaryP(currentWeatherData);
    fillMainDataDiv(currentWeatherData);
    fillTemperatureChart(allWeatherData);
    fillPrecipitationChart(allWeatherData);

    currentWeatherDOMElems.temperatureChartButton.addEventListener("click", switchCharts);
    currentWeatherDOMElems.precipitationChartButton.addEventListener("click", switchCharts);
}
