"use strict";
// List of cities for demo
const cities = [
    "New York",
    "Madrid",
    "Paris",
    "London",
    "Berlin",
    "Tokyo",
    "Mexico City",
];
let selectedCity = "";
// Fill out the city menu
function populateCities() {
    if (!citySelect)
        return;
    citySelect.innerHTML = "<option value=''>Select a city</option>";
    cities.forEach((city) => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
}
// When city changes, reset selected city
citySelect?.addEventListener("change", () => {
    if (!weatherResult || !noteSection || !noteList)
        return;
    weatherResult.textContent = "";
    noteSection.style.display = "none";
    noteList.innerHTML = "";
});
// When click on get weather, search notes history
getWeatherBtn?.addEventListener("click", async () => {
    if (!citySelect || !noteList || !noteSection)
        return;
    const city = citySelect.value;
    if (!city) {
        alert("Please select a city");
        return;
    }
    selectedCity = city;
    try {
        const res = await fetch(`/weather-history/${encodeURIComponent(city)}`);
        if (res.status === 204) {
            noteList.innerHTML = "<li>No notes found for this city</li>";
        }
        else if (res.ok) {
            const notes = await res.json();
            noteList.innerHTML = notes
                .map((note) => `<li>
              <strong>Date:</strong> ${new Date(note.date).toLocaleString()}<br>
              <strong>Weather:</strong> ${note.weather.description}, ${note.weather.temperature}°C, Humidity: ${note.weather.humidity}%<br>
              <strong>Note:</strong> ${note.note}
            </li>`)
                .join("");
        }
        else {
            noteList.innerHTML = "<li>Error fetching notes</li>";
        }
        noteSection.style.display = "block";
    }
    catch (error) {
        console.error("Error fetching weather history:", error);
        noteList.innerHTML = "<li>Error fetching notes</li>";
    }
});
// When click on save note, save data to backend and recall history
saveNoteBtn?.addEventListener("click", async () => {
    if (!noteInput || !selectedCity)
        return;
    const note = noteInput.value.trim();
    if (!note) {
        alert("Please enter a note");
        return;
    }
    try {
        const res = await fetch(`/weather/${encodeURIComponent(selectedCity)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ note }),
        });
        if (res.status === 201) {
            noteInput.value = "";
            getWeatherBtn?.click();
            alert("Note saved successfully");
        }
        else if (res.status === 404) {
            alert("City not found in weather service");
        }
        else {
            alert("Error saving note");
        }
    }
    catch (error) {
        console.error("Error saving note:", error);
        alert("Error saving note");
    }
});
// Initialize the app
populateCities();
//# sourceMappingURL=app.js.map