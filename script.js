
const balanceEl = document.getElementById('balance');
const transactionsEl = document.getElementById('transactions');
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');

const filterType = document.getElementById('filter-type');
const filterDateFrom = document.getElementById('filter-date-from');
const filterDateTo = document.getElementById('filter-date-to');
const filterDescription = document.getElementById('filter-description');
const applyFiltersButton = document.getElementById('apply-filters');
const clearFiltersButton = document.getElementById('clear-filters');

const exportCsvButton = document.getElementById('export-csv');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function getCurrentDateTime() {
  return new Date().toLocaleString();
}

function renderTransactions() {
  transactionsEl.innerHTML = '';
  transactions.forEach((transaction, index) => {
    const li = document.createElement('li');
    li.classList.add(transaction.type);
    li.innerHTML = `
      <div>
        <strong>${transaction.description}</strong> <br>
        <small>${transaction.dateTime}</small>
      </div>
      <div>
        <span class="transaction-amount ${transaction.type}">
          ${transaction.type === 'expense' ? '-' : '+'}$${Math.abs(transaction.amount).toFixed(2)}
        </span>
        <button class="delete-btn" onclick="deleteTransaction(${index})">x</button>
      </div>
    `;
    transactionsEl.appendChild(li);
  });
  updateBalance();
}

function updateBalance() {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  balanceEl.textContent = `$${(income - expense).toFixed(2)}`;
}

function addTransaction(e) {
  e.preventDefault();
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  const type = typeInput.value;

  if (!description || isNaN(amount) || amount <= 0) {
    alert('Please enter valid transaction details.');
    return;
  }

  const newTransaction = { description, amount, type, dateTime: getCurrentDateTime() };
  transactions.push(newTransaction);
  saveTransactions();
  renderTransactions();
  transactionForm.reset();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveTransactions();
  renderTransactions();
}

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function filterTransactions() {
  const type = filterType.value;
  const dateFrom = filterDateFrom.value ? new Date(filterDateFrom.value) : null;
  const dateTo = filterDateTo.value ? new Date(filterDateTo.value) : null;
  const description = filterDescription.value.toLowerCase();

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.dateTime);
    return (
      (type === 'all' || transaction.type === type) &&
      (!dateFrom || transactionDate >= dateFrom) &&
      (!dateTo || transactionDate <= dateTo) &&
      (!description || transaction.description.toLowerCase().includes(description))
    );
  });

  renderFilteredTransactions(filteredTransactions);
}

function renderFilteredTransactions(filteredTransactions) {
  transactionsEl.innerHTML = '';
  filteredTransactions.forEach(transaction => {
    const li = document.createElement('li');
    li.classList.add(transaction.type);
    li.innerHTML = `
      <div>
        <strong>${transaction.description}</strong> <br>
        <small>${transaction.dateTime}</small>
      </div>
      <div>
        <span class="transaction-amount ${transaction.type}">
          ${transaction.type === 'expense' ? '-' : '+'}$${Math.abs(transaction.amount).toFixed(2)}
        </span>
      </div>
    `;
    transactionsEl.appendChild(li);
  });
}

function clearFilters() {
  filterType.value = 'all';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  filterDescription.value = '';
  renderTransactions();
}
function exportToCSV() {
  const csvHeaders = ['Description,Amount,Type,Date/Time'];
  const csvRows = transactions.map(t =>
    `"${t.description}","${t.amount}","${t.type}","${t.dateTime}"`
  );
  const csvContent = csvHeaders.concat(csvRows).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transactions.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


transactionForm.addEventListener('submit', addTransaction);
applyFiltersButton.addEventListener('click', filterTransactions);
clearFiltersButton.addEventListener('click', clearFilters);
exportCsvButton.addEventListener('click', exportToCSV);

renderTransactions();
