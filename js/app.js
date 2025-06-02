const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const typeInput = document.getElementById('type');

const addBtn = document.getElementById('add-btn');
const transactionList = document.getElementById('transaction-list');
const balance = document.getElementById('balance');
const income = document.getElementById('income');
const expense = document.getElementById('expense');
const toggleDarkBtn = document.getElementById('toggle-dark');
const monthSelector = document.getElementById('month');

const filterAll = document.getElementById('filter-all');
const filterIncomes = document.getElementById('filter-incomes');
const filterExpenses = document.getElementById('filter-expenses');

let transactions = [];
let currentFilter = 'all';
let currentMonth = '';

// Salvar no localStorage
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Carregar do localStorage
function loadTransactions() {
  const data = localStorage.getItem('transactions');
  if (data) {
    transactions = JSON.parse(data);
  }
}

// Formatar para real
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Adicionar transação
function addTransaction() {
  const description = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const type = typeInput.value;

  if (!description || isNaN(amount) || !date) {
    alert('Preencha todos os campos corretamente!');
    return;
  }

  const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

  const transaction = {
    id: Date.now(),
    description,
    amount: finalAmount,
    date
  };

  transactions.push(transaction);
  saveTransactions();
  updateList();
  updateSummary();

  descInput.value = '';
  amountInput.value = '';
  dateInput.value = '';
}

// Remover transação
function removeTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions();
  updateList();
  updateSummary();
}

// Atualizar a lista de lançamentos
function updateList() {
  transactionList.innerHTML = '';

  transactions
    .filter(tx => {
      const isInMonth = currentMonth === '' || tx.date.slice(0, 7) === currentMonth;
      const isInFilter =
        currentFilter === 'all' ||
        (currentFilter === 'incomes' && tx.amount > 0) ||
        (currentFilter === 'expenses' && tx.amount < 0);
      return isInMonth && isInFilter;
    })
    .forEach(tx => {
      const li = document.createElement('li');
      li.style.color = tx.amount < 0 ? 'red' : 'green';
      li.textContent = `${tx.description} | ${formatCurrency(tx.amount)} | ${tx.date}`;

      const btnRemove = document.createElement('button');
      btnRemove.textContent = 'x';
      btnRemove.addEventListener('click', () => removeTransaction(tx.id));

      li.appendChild(btnRemove);
      transactionList.appendChild(li);
    });
}


// Atualizar o resumo (saldo, entradas, saídas)
function updateSummary() {
  const filtered = transactions.filter(tx =>
    (currentMonth === '' || tx.date.slice(0, 7) === currentMonth)
  );

  const total = filtered.reduce((acc, tx) => acc + tx.amount, 0);
  const incomeSum = filtered.filter(tx => tx.amount > 0).reduce((acc, tx) => acc + tx.amount, 0);
  const expenseSum = filtered.filter(tx => tx.amount < 0).reduce((acc, tx) => acc + tx.amount, 0);

  balance.textContent = formatCurrency(total);
  income.textContent = formatCurrency(incomeSum);
  expense.textContent = formatCurrency(expenseSum);
}

// Filtrar por tipo
function filterTransactions(type) {
  currentFilter = type;
  updateList();
  updateSummary();
}

// Alternar Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    toggleDarkBtn.textContent = '☀️ Light Mode';
  } else {
    toggleDarkBtn.textContent = '🌙 Dark Mode';
  }
}

// ---- Eventos ----
addBtn.addEventListener('click', addTransaction);

filterAll.addEventListener('click', () => filterTransactions('all'));
filterIncomes.addEventListener('click', () => filterTransactions('incomes'));
filterExpenses.addEventListener('click', () => filterTransactions('expenses'));

monthSelector.addEventListener('change', () => {
  currentMonth = monthSelector.value;
  updateList();
  updateSummary();
});

toggleDarkBtn.addEventListener('click', toggleDarkMode);

// ---- Inicialização ----
function init() {
  loadTransactions();
  updateList();
  updateSummary();
}

init();
