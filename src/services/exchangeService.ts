import cron from 'node-cron';
import dotenv from "dotenv";

dotenv.config();

const desiredCurrencies = [
  'USD', 'EUR', 'GBP', 'ILS', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD',
  'NZD', 'SEK', 'NOK', 'DKK', 'INR', 'SGD', 'KRW', 'ZAR', 'BRL', 'MXN'
];

let exchangeRates: Record<string, number> = {};

export const getExchangeRates = () => exchangeRates;

export async function fetchRates() {
  try {
    const API_KEY = process.env.EXCHANGE_API_KEY;
    const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();
    const allRates = data?.conversion_rates;

    if (!allRates || typeof allRates !== 'object') {
      throw new Error("Invalid conversion_rates in response");
    }

    exchangeRates = desiredCurrencies.reduce((acc, code) => {
      if (code in allRates) {
        acc[code] = allRates[code];
      }
      return acc;
    }, {} as Record<string, number>);

    console.log("✔️ Exchange rates updated");
  } catch (err) {
    console.error("❌ Failed to fetch exchange rates:", err);
  }
}


// טען מידית והפעל כל 6 שעות
fetchRates();
cron.schedule('0 */6 * * *', fetchRates, {
  timezone: 'UTC', // או Asia/Jerusalem לפי הצורך
});
