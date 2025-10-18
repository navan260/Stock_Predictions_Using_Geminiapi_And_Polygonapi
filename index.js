import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { dates } from "./date.js";

const loadingArea = document.getElementById("loadingArea");
const apiMessage = document.getElementById("apiMessage");

const tickersArr = [];

const generateReportBtn = document.querySelector(".generate-report-btn");

generateReportBtn.addEventListener("click", fetchStockData);

document.getElementById("ticker-input-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const tickerInput = document.getElementById("ticker-input");
  if (tickerInput.value.length > 2) {
    generateReportBtn.disabled = false;
    const newTickerStr = tickerInput.value;
    tickersArr.push(newTickerStr.toUpperCase());
    tickerInput.value = "";
    renderTickers();
  } else {
    const label = document.getElementsByTagName("label")[0];
    label.style.color = "red";
    label.textContent =
      "You must add at least one ticker. A ticker is a symbol for a stock. E.g TSLA for tesla.";
  }
});

async function fetchStockData() {
  document.querySelector(".action-panel").style.display = "none";
  loadingArea.style.display = "flex";
  try {
    const stockData = await Promise.all(
      tickersArr.map(async (ticker) => {
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=Fd2e2G9KtNigHEVBqfBof9QMe4KtV8GQ`;
        const response = await fetch(url);
        const data = await response.text();
        const status = await response.status;
        if (status === 200) {
          apiMessage.innerText = "Creating report...";
          return data;
        } else {
          loadingArea.innerText = "There was an error fetching stock data.";
        }
      })
    );
    fetchReport(stockData.join(""));
  } catch (err) {
    loadingArea.innerText = "There was an error fetching stock data.";
    console.error("error: ", err);
  }
}

async function fetchReport(data) {
  const API_KEY = "AIzaSyDhpB0cmRd-yNWd8yIGAe0UUE1TsfxQVx0";

  apiMessage.innerText = "🤖 Analyzing data and writing report...";

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a trading guru. Given the following data on stock prices over the past 3 days, write a report of no more than 150 words describing the stock's performance and recommending whether to buy, hold, or sell.
        
        Data:
        ${data}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);

    renderReport(text);
  } catch (err) {
    console.error("Error fetching AI report:", err);

    apiMessage.innerText =
      "Error from AI. Please check the console or API key.";
  }
}

function renderReport(output) {
  loadingArea.style.display = "none";
  const outputArea = document.querySelector(".output-panel");
  const report = document.createElement("p");
  outputArea.appendChild(report);
  report.textContent = output;
  outputArea.style.display = "flex";
}

function renderTickers() {
  const tickersList = document.getElementById("tickers-list");
  tickersList.textContent +=
    tickersArr.length > 0 ? tickersArr[tickersArr.length - 1] + " " : "";
}
