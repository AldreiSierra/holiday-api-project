//Great job on the code! It's clean, organized, and easy to follow.
//The main features are working well,but adding input validation and improving the error messages would make the app even better.

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

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function saveToLocal() {
  const data = JSON.parse(localStorage.getItem("holidays")) || {};
  data[selectedCountry] = holidays;
  localStorage.setItem("holidays", JSON.stringify(data));
}

function loadFromLocal() {
  const data = JSON.parse(localStorage.getItem("holidays")) || {};
  holidays = data[selectedCountry] || [];
  renderHolidays(holidays);
}

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

btn.addEventListener("click", () => {
  btn.disabled = true;
  btn.textContent = "Loading...";

  fetch(`https://date.nager.at/api/v3/PublicHolidays/2025/${selectedCountry}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    })
    .then(data => {
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

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = holidays.filter(h =>
    h.localName.toLowerCase().includes(keyword) || h.date.includes(keyword)
  );
  renderHolidays(filtered);
});

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

function deleteHoliday(index) {
  const holiday = holidays[index];
  const confirmed = confirm(`🗑️ Are you sure you want to delete "${holiday.localName}" on ${holiday.date}?`);

  if (confirmed) {
    const deleted = holidays.splice(index, 1);
    saveToLocal();
    renderHolidays(holidays);
    showToast(`🗑️ Deleted: ${deleted[0].localName}`);
  } else {
    showToast("❌ Deletion cancelled.");
  }
}

countrySelect.addEventListener("change", () => {
  selectedCountry = countrySelect.value;
  loadFromLocal();
  showToast(`🌍 Switched to ${selectedCountry}`);
});

loadFromLocal();

