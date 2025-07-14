const btn = document.getElementById("loadBtn");
const holidayList = document.getElementById("holidayList");
const searchInput = document.getElementById("searchInput");
const addForm = document.getElementById("addForm");
const newDate = document.getElementById("newDate");
const newName = document.getElementById("newName");
const toast = document.getElementById("toast");
const countrySelect = document.getElementById("countrySelect");

let holidays = [];
let selectedCountry = countrySelect.value;

// Utility to show notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Save to localStorage per country
function saveToLocal() {
  const data = JSON.parse(localStorage.getItem("holidays")) || {};
  data[selectedCountry] = holidays;
  localStorage.setItem("holidays", JSON.stringify(data));
}

// Load from localStorage per country
function loadFromLocal() {
  const data = JSON.parse(localStorage.getItem("holidays")) || {};
  holidays = data[selectedCountry] || [];
  renderHolidays(holidays);
}

// Render holidays to the UI
function renderHolidays(list) {
  holidayList.innerHTML = "";

  if (list.length === 0) {
    holidayList.innerHTML = `<p style="text-align:center;">No holidays available for ${selectedCountry}.</p>`;
    return;
  }

  list.sort((a, b) => new Date(a.date) - new Date(b.date));

  list.forEach((holiday, index) => {
    const card = document.createElement("div");
    card.className = "holiday-card";

    card.innerHTML = `
      <div class="holiday-date">${holiday.date}</div>
      <div class="holiday-name">${holiday.localName}</div>
      <button class="delete-btn" onclick="deleteHoliday(${index})">Delete</button>
    `;

    holidayList.appendChild(card);
  });
}

// Load holidays from API
btn.addEventListener("click", () => {
  btn.disabled = true;
  btn.textContent = "Loading...";

  fetch(`https://date.nager.at/api/v3/PublicHolidays/2025/${selectedCountry}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    })
    .then(data => {
      // Filter out duplicates
      holidays = data;
      saveToLocal();
      renderHolidays(holidays);
      showToast(`✅ Loaded ${selectedCountry} holidays!`);
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Failed to load holidays.");
    })
    .finally(() => {
      btn.textContent = "📅 Load Holidays";
      btn.disabled = false;
    });
});

// Filter search results
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = holidays.filter(h =>
    h.localName.toLowerCase().includes(keyword) || h.date.includes(keyword)
  );
  renderHolidays(filtered);
});

// Add custom holiday
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = newDate.value;
  const name = newName.value.trim();

  if (!date || !name) return;

  holidays.push({ date, localName: name });
  saveToLocal();
  renderHolidays(holidays);

  newDate.value = "";
  newName.value = "";
  showToast("🎉 Holiday added!");
});

// Delete specific holiday
function deleteHoliday(index) {
  const deleted = holidays.splice(index, 1);
  saveToLocal();
  renderHolidays(holidays);
  showToast(`🗑️ Deleted: ${deleted[0].localName}`);
}

// Country change → clear & load saved holidays (if any)
countrySelect.addEventListener("change", () => {
  selectedCountry = countrySelect.value;
  loadFromLocal();
  showToast(`🌍 Switched to ${selectedCountry}`);
});

// Load default country on start
loadFromLocal();
