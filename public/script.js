// script.js (module)
const apiBase = window.location.origin + '/api/transactions';

const $ = (sel) => document.querySelector(sel);

const listEl = $('#list');
const balanceEl = $('#balance');
const moneyPlusEl = $('#money-plus');
const moneyMinusEl = $('#money-minus');
const form = $('#form');
const textInput = $('#text');
const amountInput = $('#amount');

async function fetchTransactions() {
  try {
    const res = await fetch(apiBase);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

function formatCurrency(n) {
  // format in Indian Rupee style, fallback to en-IN if available
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
  } catch {
    return (n >= 0 ? '+' : '-') + '₹' + Math.abs(n).toFixed(2);
  }
}

function renderTransactionItem(tx) {
  const li = document.createElement('li');
  li.className = tx.amount >= 0 ? 'plus' : 'minus';
  li.innerHTML = `
    <span class="text">${escapeHtml(tx.text)}</span>
    <span>
      <span>${formatCurrency(tx.amount)}</span>
      <button class="delete-btn" data-id="${tx._id}" title="Delete" aria-label="Delete transaction">✕</button>
    </span>
  `;
  // attach delete handler
  li.querySelector('.delete-btn').addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    await refresh();
  });
  return li;
}

function escapeHtml(text) {
  // basic escape to prevent XSS when inserting into DOM
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

async function addTransactionToServer({ text, amount }) {
  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, amount })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add transaction');
    return json.data;
  } catch (err) {
    throw err;
  }
}

async function deleteTransaction(id) {
  try {
    const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete');
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function updateSummary(transactions) {
  const amounts = transactions.map(t => Number(t.amount));
  const total = amounts.reduce((acc, val) => acc + val, 0);
  const income = amounts.filter(a => a > 0).reduce((acc, val) => acc + val, 0);
  const expense = amounts.filter(a => a < 0).reduce((acc, val) => acc + val, 0);

  balanceEl.innerText = formatCurrency(total);
  moneyPlusEl.innerText = formatCurrency(income);
  moneyMinusEl.innerText = formatCurrency(Math.abs(expense));
}

async function refresh() {
  listEl.innerHTML = '';
  const transactions = await fetchTransactions();
  if (transactions.length === 0) {
    listEl.innerHTML = '<li class="empty">No transactions yet</li>';
  } else {
    transactions.forEach(tx => {
      listEl.appendChild(renderTransactionItem(tx));
    });
  }
  updateSummary(transactions);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = textInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (!text) {
    alert('Please provide a description.');
    return;
  }
  if (isNaN(amount) || !isFinite(amount)) {
    alert('Please provide a valid amount (use negative for expense).');
    return;
  }

  try {
    await addTransactionToServer({ text, amount });
    textInput.value = '';
    amountInput.value = '';
    await refresh();
  } catch (err) {
    alert('Could not add transaction: ' + (err.message || 'Unknown error'));
    console.error(err);
  }
});

// init
refresh();
