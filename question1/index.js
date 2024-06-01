const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 8000;
const WSize = 10;

const Bearer_token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3MjE4ODg0LCJpYXQiOjE3MTcyMTg1ODQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImZhZGRlZWYyLTFkYzMtNDA5Ny1hMzI1LTgxMTcxMjc3ZDhhYiIsInN1YiI6InNhaGlsLjIxMjVjc2l0MTA1N0BraWV0LmVkdSJ9LCJjb21wYW55TmFtZSI6IktJRVQgR3JvdXAgb2YgSW5zdGl0dXRpb25zLCBHaGF6aWFiYWQiLCJjbGllbnRJRCI6ImZhZGRlZWYyLTFkYzMtNDA5Ny1hMzI1LTgxMTcxMjc3ZDhhYiIsImNsaWVudFNlY3JldCI6IkVrWnZRSFhUa294d21VU08iLCJvd25lck5hbWUiOiJTYWhpbCBCaXNodCIsIm93bmVyRW1haWwiOiJzYWhpbC4yMTI1Y3NpdDEwNTdAa2lldC5lZHUiLCJyb2xsTm8iOiIyMTAwMjkwMTEwMTM3In0.p6kB_5FOc-RR288SlkA1dBtnyf6aVHe4pkFj_lP7TZ4";

// Initialize window state
let window = [];

const urlMap = {
  p: "http://20.244.56.144/test/primes",
  f: "http://20.244.56.144/test/fibo",
  e: "http://20.244.56.144/test/even",
  r: "http://20.244.56.144/test/random",
};

const fetchNumbersFromTestServer = async (numberid) => {
  if (!urlMap[numberid]) return [];

  try {
    const response = await axios.get(urlMap[numberid], {
      headers: {
        Authorization: `Bearer ${Bearer_token}`,
      },
    });
    if (response.status === 200) {
      return response.data.numbers || [];
    }
  } catch (error) {
    return [];
  }

  return [];
};

app.get("/numbers/:numberid", async (req, res) => {
  const numberid = req.params.numberid;

  // Fetch numbers from the test server
  const numbers = await fetchNumbersFromTestServer(numberid);

  if (!numbers.length) {
    return res.status(400).json({
      error: "Failed to fetch numbers from the test server or invalid numberid",
    });
  }

  // Current state before update
  const windowPrevState = [...window];

  // Filter unique numbers and update the window
  const uniqueNumbers = numbers.filter((num) => !window.includes(num));

  uniqueNumbers.forEach((num) => {
    if (window.length >= WSize) {
      window.shift(); // Remove the oldest number
    }
    window.push(num);
  });

  // Calculate the average of the current window
  const avg = window.length
    ? window.reduce((acc, num) => acc + num, 0) / window.length
    : 0;

  // Create response
  const response = {
    numbers: numbers,
    windowPrevState: windowPrevState,
    windowCurrState: window,
    avg: parseFloat(avg.toFixed(2)),
  };

  return res.status(200).json(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
