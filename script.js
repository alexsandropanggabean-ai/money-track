
const balanceEl = document.getElementById("balance");
const goalForm = document.getElementById("goal-form");
const goalNameInput = document.getElementById("goal-name");
const goalTargetInput = document.getElementById("goal-target");
const goalDisplay = document.getElementById("goal-display");
const savingForm = document.getElementById("saving-form");
const amountInput = document.getElementById("amount");
const noteInput = document.getElementById("note");
const historyEl = document.getElementById("history");

const STORAGE_KEY = "moneytrack-data";

let data = {
  balance: 0,
  goal: null,
  history: []
};

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    const parsed = JSON.parse(saved);

    if (
      typeof parsed.balance !== "number" ||
      !Number.isFinite(parsed.balance) ||
      parsed.balance < 0 ||
      !Array.isArray(parsed.history)
    ) {
      return;
    }

    data.balance = parsed.balance;
    data.history = parsed.history;

    if (
      parsed.goal &&
      typeof parsed.goal.name === "string" &&
      typeof parsed.goal.target === "number" &&
      Number.isFinite(parsed.goal.target) &&
      parsed.goal.target > 0
    ) {
      data.goal = parsed.goal;
    }
  } catch (error) {
    console.error("Data tabungan gagal dibaca:", error);
  }
}

function renderGoal() {
  goalDisplay.replaceChildren();

  if (!data.goal) {
    const message = document.createElement("p");
    message.textContent = "Belum ada tujuan tabungan.";
    goalDisplay.appendChild(message);
    return;
  }

  const { name, target } = data.goal;
  const percent = Math.min(
    100,
    (data.balance / target) * 100
  );

  const title = document.createElement("h3");
  title.textContent = "🎯 " + name;

  const amount = document.createElement("p");
  amount.textContent =
    `${formatRupiah(data.balance)} dari ${formatRupiah(target)}`;

  const track = document.createElement("div");
  track.className = "progress-track";

  const fill = document.createElement("div");
  fill.className = "progress-fill";
  fill.style.width = percent + "%";

  track.appendChild(fill);

  const progress = document.createElement("p");
  progress.textContent = `${percent.toFixed(1)}% tercapai`;

  goalDisplay.append(title, amount, track, progress);

  if (data.balance >= target) {
    const complete = document.createElement("p");
    complete.textContent = "🎉 Target tabungan tercapai!";
    goalDisplay.appendChild(complete);
  }
}

function renderHistory() {
  historyEl.replaceChildren();

  if (data.history.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Belum ada transaksi.";
    historyEl.appendChild(item);
    return;
  }

  data.history.forEach((entry) => {
    const item = document.createElement("li");
    const date = new Date(entry.date).toLocaleDateString("id-ID");

    item.textContent =
      `${date} · +${formatRupiah(entry.amount)}` +
      (entry.note ? ` · ${entry.note}` : "");

    historyEl.appendChild(item);
  });
}

function render() {
  balanceEl.textContent = formatRupiah(data.balance);
  renderGoal();
  renderHistory();
}

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = goalNameInput.value.trim();
  const target = Number(goalTargetInput.value);

  if (!name || !Number.isSafeInteger(target) || target <= 0) {
    alert("Masukkan nama dan target tabungan yang valid.");
    return;
  }

  data.goal = { name, target };

  saveData();
  render();
  goalForm.reset();
});

savingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(amountInput.value);
  const note = noteInput.value.trim();

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    alert("Masukkan nominal tabungan yang valid.");
    return;
  }

  if (!Number.isSafeInteger(data.balance + amount)) {
    alert("Nominal tabungan terlalu besar.");
    return;
  }

  data.balance += amount;

  data.history.unshift({
    amount,
    note,
    date: new Date().toISOString()
  });

  saveData();
  render();
  savingForm.reset();
});

loadData();
render();
      
