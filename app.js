// Function to get all transactions
function getTransactions() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
}

// Function to save transaction
function saveTransactions(transactions) {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}
// Function to add a new transaction
function addTransaction(transaction) {
    const transactions = getTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);
    updateDashboard();
}

// now it updates the dashboard and transaction history dynmically
function updateDashboard() {
    const transactions = getTransactions();
    const income = transactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
    const expense = transactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);
    const balance = income - expense;
    document.getElementById("income").innerText = `$${income.toFixed(2)}`;
    document.getElementById("expense").innerText = `$${expense.toFixed(2)}`;
    document.getElementById("balance").innerText = `$${balance.toFixed(2)}`;
    updateTransactionHistory();
}

function updateTransactionHistory() {
    const transactions = getTransactions();
    const historyContainer = document.getElementById("transaction-history");
    historyContainer.innerHTML = "";
    transactions.forEach(tx => {
        const txElement = document.createElement("div");
        txElement.classList.add("transaction");
        txElement.innerText = `${tx.type}: $${tx.amount.toFixed(2)}`;
        historyContainer.appendChild(txElement);
    });
}

function updateTotals() {
    const transactions = getTransactions();
    let income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    let expense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (document.getElementById('total-income')) {
        document.getElementById('total-income').textContent = `$${income.toFixed(2)}`;
    }
    if (document.getElementById('total-expense')) {
        document.getElementById('total-expense').textContent = `$${expense.toFixed(2)}`;
    }
}

function renderTransactions() {
    const tbody = document.getElementById('transaction-history');
    tbody.innerHTML = '';
    const transactions = getTransactions();
    transactions.forEach(tx => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-2 px-3">${tx.date}</td>
            <td class="py-2 px-3">${tx.category}</td>
            <td class="py-2 px-3 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}">${tx.amount > 0 ? '+' : '-'}$${Math.abs(tx.amount).toFixed(2)}</td>
            <td class="py-2 px-3">${tx.notes || '-'}</td>
            <td class="py-2 px-3 flex space-x-2">
                <button onclick="editTransaction(${tx.id})" class="text-blue-500 hover:underline"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTransaction(${tx.id})" class="text-red-500 hover:underline"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editTransaction(id) {
    alert('Edit transaction ' + id);
}

function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        let transactions = getTransactions();
        transactions = transactions.filter(tx => tx.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
        updateTotals();
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof updateTransactionHistory === 'function') updateTransactionHistory();
    }
}
