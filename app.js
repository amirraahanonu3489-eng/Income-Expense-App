// app.js

// ---------- Utility Functions ----------
function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

function saveTransactions(transactions) {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

// ---------- Dashboard (index.html) ----------
if (document.title.includes("Dashboard")) {
  const totalIncomeEl = document.getElementById("total-income");
  const totalExpenseEl = document.getElementById("total-expense");
  const balanceEl = document.getElementById("balance");
  const chartCanvas = document.getElementById("expenseChart");
  let chart;
 
  function loadDashboard() {
    const transactions = getTransactions();

    let totalIncome = 0;
    let totalExpense = 0;
    const incomeByCategory = {};
    const expenseByCategory = {};

    transactions.forEach((t) => {
      const amount = Number(t.amount);
      if (t.type === "income") {
        totalIncome += amount;
        incomeByCategory[t.category] =
          (incomeByCategory[t.category] || 0) + amount;
      } else if (t.type === "expense") {
        totalExpense += amount;
        expenseByCategory[t.category] =
          (expenseByCategory[t.category] || 0) + amount;
      }
    });

    const balance = totalIncome - totalExpense;

    totalIncomeEl.textContent = totalIncome.toFixed(2);
    totalExpenseEl.textContent = totalExpense.toFixed(2);
    balanceEl.textContent = balance.toFixed(2);

    if (chart) chart.destroy();
    if (chartCanvas) {
      chart = new Chart(chartCanvas, {
        type: "pie",
        data: {
          labels: ["Income", "Expense"],
          datasets: [
            {
              label: "Amount ($)",
              data: [totalIncome, totalExpense],
              backgroundColor: ["#34d399", "#f87171"], // green and red
            },
          ],
        },
      });
    }
  }

  document.addEventListener("DOMContentLoaded", loadDashboard);
}

// ---------- Add Transaction (transactions.html) ----------
if (document.title.includes("Add Transaction")) {
  const form = document.getElementById("transaction-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const notes = document.getElementById("notes").value.trim();

    if (!type || !category || !amount || !date) {
      alert("⚠️ Please fill out all required fields.");
      return;
    }

    const transactions = getTransactions();
    const newTransaction = {
      id: Date.now(),
      type,
      category,
      amount: Math.abs(amount),
      date,
      notes,
    };

    transactions.push(newTransaction);
    saveTransactions(transactions);

    alert("✅ Transaction saved successfully!");
    form.reset();
  });
}

// ---------- Transaction History (history.html) ----------
if (document.title.includes("Transaction History")) {
  const history = document.querySelector(".transaction-history");
  const totalIncomeEl = document.getElementById("total-income");
  const totalExpenseEl = document.getElementById("total-expense");

  function renderHistory() {
    const transactions = getTransactions();
    history.innerHTML = "";

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      const amount = Number(t.amount);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="py-2 px-3">${t.date}</td>
        <td class="py-2 px-3 capitalize">${t.category}</td>
        <td class="py-2 px-3 ${t.type === "income" ? "text-green-600" : "text-red-600"}">
          ${t.type === "income" ? "+" : "-"}${formatCurrency(t.amount)}
        </td>
        <td class="py-2 px-3">${t.notes || "-"}</td>
        <td class="py-2 px-3">
          <button class="edit-btn text-blue-500 hover:text-blue-700" data-id="${t.id}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="delete-btn text-red-500 hover:text-red-700" data-id="${t.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      history.appendChild(tr);

      if (t.type === "income") totalIncome += amount;
      else totalExpense += amount;
    });

    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpenseEl.textContent = formatCurrency(totalExpense);

    // Delete button 
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest("button").dataset.id;
        const updatedTransactions = getTransactions().filter(
          (t) => t.id != id
        );
        saveTransactions(updatedTransactions);
        renderHistory();
      });
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest("button").dataset.id;
        const transactions = getTransactions();
        const transaction = transactions.find((t) => t.id == id);

        if (!transaction) return alert("Transaction not found!");

        // edit prompts
        const newAmount = prompt("Enter new amount:", transaction.amount);
        const newNotes = prompt("Edit notes (optional):", transaction.notes || "");
        const newCategory = prompt("Edit category (optional):", transaction.category || "");

        if (newAmount === null || isNaN(newAmount)) return; // Cancel or invalid
        transaction.amount = Number(newAmount);
        transaction.notes = newNotes;
        transaction.category = newCategory;

        // Save updated list
        saveTransactions(transactions);
        renderHistory();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", renderHistory);
}


