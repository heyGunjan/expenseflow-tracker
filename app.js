const modal = document.querySelector("#transactionModal");
const addBtn = document.querySelector("#addTransactionBtn");
const transactionsAddBtn = document.querySelector("#transactionsAddBtn");
const closeBtn = document.querySelector("#closeModalBtn");
const form = document.querySelector("#transactionForm");
const transactionList = document.querySelector("#transactionList");
const balanceEl = document.querySelector("#balance");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const categoryFilter = document.querySelector("#categoryFilter");
const toast = document.querySelector("#toast");
const categoryRows = document.querySelectorAll(".category-row");
const sortFilter = document.querySelector("#sortFilter");
const chart = document.querySelector(".chart-placeholder");
const clearAllBtn = document.querySelector("#clearAllBtn");

const clearAllConfirm = document.querySelector("#clearAllConfirm");
const cancelClearAll = document.querySelector("#cancelClearAll");
const confirmClearAll = document.querySelector("#confirmClearAll");

let spending = {
  food: 0,
  transport: 0,
  shopping: 0,
  bills: 0,
};

const searchInput = document.querySelector("#searchInput");

function openAddTransactionModal() {
  editId = null;

  form.reset();

  selectedType = "expense";

  typeButtons.forEach((button) => {
    button.classList.remove("active");
  });

  document.querySelector('[data-type="expense"]').classList.add("active");

  document.querySelector(".submit-btn").textContent = "Add Transaction";

  modal.classList.remove("hidden");
}

addBtn.addEventListener("click", openAddTransactionModal);

transactionsAddBtn.addEventListener("click", openAddTransactionModal);

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  editId = null;
  form.reset();
  document.querySelector(".submit-btn").textContent = "Add Transaction";
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

clearAllBtn.addEventListener("click", () => {
  clearAllConfirm.classList.remove("hidden");
});

cancelClearAll.addEventListener("click", () => {
  clearAllConfirm.classList.add("hidden");
});

clearAllConfirm.addEventListener("click", (evt) => {
  if (evt.target === clearAllConfirm) {
    clearAllConfirm.classList.add("hidden");
  }
});

confirmClearAll.addEventListener("click", () => {
  transactions = [];

  localStorage.removeItem("transactions");

  renderTransactions();
  updateSummary();

  clearAllConfirm.classList.add("hidden");
});

const settingsClearBtn = document.querySelector("#settingsClearBtn");

settingsClearBtn.addEventListener("click", () => {
  clearAllConfirm.classList.remove("hidden");
});

const typeButtons = document.querySelectorAll(".type-btn");

let selectedType = "expense";
let transactions = [];

let selectedCurrency = localStorage.getItem("currency") || "INR";
const currencySetting = document.querySelector("#currencySetting");

currencySetting.value = selectedCurrency;

currencySetting.addEventListener("change", () => {
  selectedCurrency = currencySetting.value;

  localStorage.setItem("currency", selectedCurrency);

  updateSummary();
  renderTransactions();
});

let selectedTheme = localStorage.getItem("theme") || "dark";

const themeSetting = document.querySelector("#themeSetting");

themeSetting.value = selectedTheme;
document.body.classList.toggle("light-theme", selectedTheme === "light");

themeSetting.addEventListener("change", () => {
  selectedTheme = themeSetting.value;

  localStorage.setItem("theme", selectedTheme);

  document.body.classList.toggle("light-theme", selectedTheme === "light");
});

const savedTransactions = localStorage.getItem("transactions");

if (savedTransactions) {
  transactions = JSON.parse(savedTransactions);
}

renderTransactions();
updateSummary();

function filterTransactions() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  const sortValue = sortFilter.value;

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchText);

    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  filteredTransactions.sort((a, b) => {
    if (sortValue === "high") {
      return b.amount - a.amount;
    }

    if (sortValue === "low") {
      return a.amount - b.amount;
    }

    if (sortValue === "newest") {
      return new Date(b.date) - new Date(a.date);
    }

    if (sortValue === "oldest") {
      return new Date(a.date) - new Date(b.date);
    }
  });

  renderTransactions(filteredTransactions);
}
sortFilter.addEventListener("change", filterTransactions);

searchInput.addEventListener("input", filterTransactions);

categoryFilter.addEventListener("change", filterTransactions);

typeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    typeButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    selectedType = button.dataset.type;

    
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();


  const description = document.querySelector("#description").value;
  const amount = Number(document.querySelector("#amount").value);
  const category = document.querySelector("#category").value;
  const date = document.querySelector("#date").value;

  if (amount <= 0) {
    alert("Amount must be greater than 0");
    return;
  }

  const transaction = {
    id: editId !== null ? editId : Date.now(),
    description,
    amount,
    category,
    date,
    type: selectedType,
  };

  if (editId !== null) {
    const index = transactions.findIndex((transaction) => {
      return transaction.id === editId;
    });

    transactions[index] = transaction;

    editId = null;
  } else {
    transactions.push(transaction);
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));

  renderTransactions();
  updateSummary();

  toast.style.display = "block";

  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 10);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(15px)";
  }, 1700);

  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);

  form.reset();

  selectedType = "expense";

  typeButtons.forEach((button) => {
    button.classList.remove("active");
  });

  document.querySelector('[data-type="expense"]').classList.add("active");
  modal.classList.add("hidden");

});

function renderTransactions(list = transactions) {
  const dashboardList = document.querySelector("#transactionList");
  const allTransactionsList = document.querySelector("#allTransactionsList");

  dashboardList.innerHTML = "";
  allTransactionsList.innerHTML = "";

  if (list.length === 0) {
    const emptyMessage = `
    <div class="empty-state">
      <div>💸</div>
      <h3>No transaction yet</h3>
      <p>Add your first transaction to get started.</p>
    </div>
  `;

    dashboardList.innerHTML = emptyMessage;
    allTransactionsList.innerHTML = emptyMessage;

    return;
  }

  list.forEach((transaction, index) => {
    const transactionItem = document.createElement("div");

    transactionItem.classList.add("transaction-item");
    transactionItem.style.animationDelay = `${index * 0.08}s`;

    const icons = {
      food: "🍔",
      transport: "🚗",
      shopping: "🛍️",
      bills: "💡",
      salary: "💰",
      other: "📦",
    };


    const formattedDate = new Date(transaction.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    transactionItem.innerHTML = `
        <div class="transaction-info">

  <div class="transaction-icon">
    ${icons[transaction.category]}
  </div>

  <div class="transaction-details">
    <div class="transaction-name">${transaction.description}</div>
    <div class="transaction-category">${transaction.category}</div>
    <div class="transaction-date">${formattedDate}</div>
  </div>

</div>

<div class="transaction-amount ${transaction.type}">
  ${transaction.type === "expense" ? "-" : "+"}${formatCurrency(transaction.amount)}
</div>

<div class="transaction-actions">
  <button class="edit-btn" data-id="${transaction.id}">
    Edit
  </button>

  <button class="delete-btn" data-id="${transaction.id}">
    Delete
  </button>
</div>
        `;

    dashboardList.appendChild(transactionItem.cloneNode(true));
    allTransactionsList.appendChild(transactionItem);
  });
}

const deleteConfirm = document.querySelector("#deleteConfirm");
const cancelDelete = document.querySelector("#cancelDelete");
const confirmDelete = document.querySelector("#confirmDelete");

let deleteId = null;
let editId = null;

[transactionList, allTransactionsList].forEach((list) => {
  list.addEventListener("click", (evt) => {
    if (evt.target.classList.contains("delete-btn")) {
      const id = Number(evt.target.dataset.id);

      deleteId = id;
      deleteConfirm.classList.remove("hidden");
    }
  });
});

[transactionList, allTransactionsList].forEach((list) => {
  list.addEventListener("click", (evt) => {
    if (evt.target.classList.contains("edit-btn")) {
      const id = Number(evt.target.dataset.id);

      editId = id;

      const transaction = transactions.find((transaction) => {
        return transaction.id === id;
      });


      document.querySelector("#description").value = transaction.description;
      document.querySelector("#amount").value = transaction.amount;

      selectedType = transaction.type;

      typeButtons.forEach((button) => {
        button.classList.remove("active");
      });

      document.querySelector(`[data-type="${transaction.type}"]`).classList.add("active");
      document.querySelector("#category").value = transaction.category;
      document.querySelector("#date").value = transaction.date;

      document.querySelector(".submit-btn").textContent = "Update Transaction";

      modal.classList.remove("hidden");
    }
  });
});

cancelDelete.addEventListener("click", () => {
  deleteConfirm.classList.add("hidden");
});

confirmDelete.addEventListener("click", () => {
  transactions = transactions.filter((transaction) => {
    return transaction.id != deleteId;
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  renderTransactions();
  updateSummary();

  deleteConfirm.classList.add("hidden");
  deleteId = null;
});

deleteConfirm.addEventListener("click", (evt) => {
  if (evt.target === deleteConfirm) {
    deleteConfirm.classList.add("hidden");
  }
});

function formatCurrency(amount) {
  if (selectedCurrency === "USD") {
    return `$${amount.toLocaleString("en-US")}`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

function updateSummary() {
  let income = 0;
  let expense = 0;

  spending = {
    food: 0,
    transport: 0,
    shopping: 0,
    bills: 0,
    other: 0,
  };

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      income += transaction.amount;
    } else {
      expense += transaction.amount;

      if (spending[transaction.category] !== undefined) {
        spending[transaction.category] += transaction.amount;
      }
    }
  });

  const balance = income - expense;

  const analyticsIncome = document.querySelector("#analyticsIncome");
  const analyticsExpense = document.querySelector("#analyticsExpense");
  const analyticsSavings = document.querySelector("#analyticsSavings");

  analyticsIncome.textContent = formatCurrency(income);
  analyticsExpense.textContent = formatCurrency(expense);
  analyticsSavings.textContent = formatCurrency(balance);

  animateNumber(incomeEl, income);
  animateNumber(expenseEl, expense);
  animateNumber(balanceEl, balance);

  const colors = {
    food: "#B8F35A",
    transport: "#5EE6A8",
    shopping: "#FF6B6B",
    bills: "#39433B",
    other: "#C084FC",
  };

  categoryRows.forEach((row) => {
    const category = row.querySelector(".category-info span:last-child").textContent.toLowerCase();

    let total = 0;

    transactions.forEach((transaction) => {
      if (transaction.category === category && transaction.type === "expense") {
        total += transaction.amount;
      }
    });

    row.querySelector(".category-amount").textContent = formatCurrency(total);
    row.querySelector(".category-dot").style.backgroundColor = colors[category];

    const percentage =
      total > 0
        ? Math.round(
            (total / Object.values(spending).reduce((sum, amount) => sum + amount, 0)) * 100,
          )
        : 0;

    row.querySelector(".category-percentage").textContent = `${percentage}%`;
  });

  const total = Object.values(spending).reduce((sum, amount) => sum + amount, 0);

  if (total > 0) {
    let currentDegree = 0;

    const slices = Object.entries(spending).map(([category, amount]) => {
      const degree = (amount / total) * 360;

      const slice = `${colors[category]} ${currentDegree}deg ${currentDegree + degree}deg`;

      currentDegree += degree;

      return slice;
    });

    chart.style.background = `conic-gradient(${slices.join(", ")})`;
  } else {
    chart.style.background = "#202820";
  }

  const analyticsCategories = document.querySelector("#analyticsCategories");

  analyticsCategories.innerHTML = "";

  Object.entries(spending).forEach(([category, amount]) => {
    analyticsCategories.innerHTML += `
      <div class="analytics-category-row">
        <span class="analytics-dot" style="background: ${colors[category]}"></span>
        <span>${category}</span>
        <strong>${formatCurrency(amount)}</strong>
      </div>
    `;
  });
}

chart.addEventListener("mousemove", (event) => {
  const rect = chart.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const x = event.clientX - centerX;
  const y = event.clientY - centerY;

  let angle = Math.atan2(y, x) * (180 / Math.PI);

  angle += 90;

  if (angle < 0) {
    angle += 360;
  }

  const total = Object.values(spending).reduce((sum, amount) => sum + amount, 0);

  if (total === 0) return;

  let currentDegree = 0;

  for (const [category, amount] of Object.entries(spending)) {
    const degree = (amount / total) * 360;

    if (angle >= currentDegree && angle < currentDegree + degree) {
      const percentage = Math.round((amount / total) * 100);

      const tooltip = chart.querySelector(".chart-tooltip");

      tooltip.textContent = `${category} — ${formatCurrency(amount)} — ${percentage}%`;
      tooltip.style.opacity = "1";

      break;
    }

    currentDegree += degree;
  }
});

chart.addEventListener("mouseleave", () => {
  const tooltip = chart.querySelector(".chart-tooltip");

  tooltip.style.opacity = "0";
});
const navLinks = document.querySelectorAll(".nav-link");

const pages = {
  dashboard: document.querySelector("#dashboardPage"),
  transactions: document.querySelector("#transactionsPage"),
  analytics: document.querySelector("#analyticsPage"),
  settings: document.querySelector("#settingsPage"),
};

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    // active button change
    navLinks.forEach((item) => {
      item.classList.remove("active");
    });

    link.classList.add("active");

    // page identify
    const pageName = link.dataset.page;

    // sab pages hide
    Object.values(pages).forEach((page) => {
      page.classList.add("hidden");
    });

    // selected page show
    pages[pageName].classList.remove("hidden");
  });
});

window.addEventListener("load", () => {
  const loader = document.querySelector("#loader");

  setTimeout(() => {
    loader.style.opacity = "0";

    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
  }, 1800);
});

const ambient = document.querySelector("#ambient-background");

document.addEventListener("mousemove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5) * 30;
  const y = (event.clientY / window.innerHeight - 0.5) * 30;

  ambient.style.transform = `translate(${x}px, ${y}px)`;
});

function animateNumber(element, target) {
  let current = 0;

  const step = target / 30;

  const timer = setInterval(() => {
    current += step;

    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    element.textContent = formatCurrency(Math.round(current));
  }, 20);
}
