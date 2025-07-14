const btn = document.getElementById("loadBtn");
const holidayList = document.getElementById("holidayList");

btn.addEventListener("click", () => {
  fetch("https://date.nager.at/api/v3/PublicHolidays/2025/PH")
    .then(res => {
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    })
    .then(data => {
      holidayList.innerHTML = "";
      data.forEach(h => {
        const li = document.createElement("li");
        li.textContent = `${h.date} - ${h.localName}`;
        holidayList.appendChild(li);
      });
    })
    .catch(err => {
      console.error(err);
      alert("Could not load holidays.");
    });
});
