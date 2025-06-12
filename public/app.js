//list of cities for demo
const cities = [
  "New York",
  "Madrid",
  "Paris",
  "London",
  "Berlin",
  "Tokyo",
  "Mexico City",
];

// get DOM elements
const citySelect = document.getElementById("city");
const getWeatherBtn = document.getElementById("getWeather");
const weatherResult = document.getElementById("weatherResult");
const noteSection = document.getElementById("noteSection");
const noteInput = document.getElementById("noteInput");
const saveNoteBtn = document.getElementById("saveNote");
const noteList = document.getElementById("noteList");

let selectedCity = "";

//fill out the city menu
function populateCities() {
  citySelect.innerHTML = "<option value=''>Select a city</option>";
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
}

// when citi change reset selected city
citySelect.addEventListener("change", () => {
  weatherResult.textContent = "";
  noteSection.style.display = "none";
  noteList.innerHTML = "";
});

//when clik on get weather search notes history

getWeatherBtn.addEventListener("click", async () => {
  const city = citySelect.value;
  if (!city) {
    alert("Please select a city");
    return;
  }
  selectedCity = city;

  //search the weather notes from bakend
  const res = await fetch(`/weather-history/${encodeURIComponent(city)}`);
  if (res.status === 204) {
    noteList.innerHTML = "<li>No notes found for this city</li>";
  } else if (res.ok) {
    const notes = await res.json();
    noteList.innerHTML = notes
      .map(
        (note) =>
          `<li>
        <strong>Date:</strong> ${new Date(note.date).toLocaleString()}<br>
         <strong>Weather:</strong> ${note.weather.description}, ${
            note.weather.temperature
          }°C, Humidity: ${note.weather.humidity}%<br>
        <strong>Note:</strong> ${note.note}
        </li>`
      )
      .join("");
  } else {
    noteList.innerHTML = "<li>Error fetching notes</li>";
  }
  noteSection.style.display = "block";
});

// when click on save note save the data backend and recall the history
saveNoteBtn.addEventListener("click", async () => {
  const note = noteInput.value.trim();
  if (!note) {
    alert("Please enter a note");
    return;
  }

  //post the note to the backend
  const res = await fetch(`/weather/${encodeURIComponent(selectedCity)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ note }),
  });
  if (res.status === 201) {
    noteInput.value = "";
    getWeatherBtn.click();
    alert("Note saved successfully");
  } else if (res.status === 404) {
    alert("city not found in weather service");
  } else {
    alert("Error saving note");
  }
});

populateCities();
