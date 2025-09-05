/* ================= GLOBAL VARS ================= */
let items = JSON.parse(localStorage.getItem("items")) || [];
let buyers = JSON.parse(localStorage.getItem("buyers")) || [];
let currentUser = localStorage.getItem("currentUser") || null;

/* ================= NAVIGATION ================= */
const links = document.querySelectorAll(".nav-links a, .nav-actions button");
const pages = document.querySelectorAll(".page");

links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const pageId = e.target.getAttribute("data-page");
    if (pageId) showPage(pageId);
  });
});

function showPage(id) {
  pages.forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/* ================= LOGIN ================= */
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "admin" && password === "1234") {
      currentUser = username;
      localStorage.setItem("currentUser", currentUser);
      showModal("Welcome Admin!");
      showPage("dashboard");
    } else {
      showModal("Invalid credentials. Try admin / 1234.");
    }
  });
}

/* ================= ADMIN ITEMS ================= */
const itemForm = document.getElementById("item-form");
const itemsTableBody = document.querySelector("#items-table tbody");

if (itemForm) {
  itemForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("item-name").value.trim();
    const price = parseFloat(document.getElementById("item-price").value);
    const weight = parseFloat(document.getElementById("item-weight").value);

    if (!name || !price || !weight) return showModal("Fill all fields!");

    const newItem = { name, price, weight };
    items.push(newItem);
    localStorage.setItem("items", JSON.stringify(items));
    renderItems();
    itemForm.reset();
    showModal("Item added successfully!");
  });
}

function renderItems() {
  if (!itemsTableBody) return;
  itemsTableBody.innerHTML = "";
  items.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>₹${item.price}</td>
      <td>${item.weight} kg</td>
      <td>
        <button class="btn-secondary" onclick="deleteItem(${index})">Delete</button>
      </td>
    `;
    itemsTableBody.appendChild(row);
  });
}
renderItems();

function deleteItem(index) {
  items.splice(index, 1);
  localStorage.setItem("items", JSON.stringify(items));
  renderItems();
  showModal("Item deleted!");
}

/* ================= BILLING ================= */
const billForm = document.getElementById("bill-form");
const billItemsDiv = document.getElementById("bill-items");
const totalAmountEl = document.getElementById("total-amount");

if (billForm) {
  billForm.addEventListener("submit", e => {
    e.preventDefault();
    const buyer = document.getElementById("buyer-name").value.trim();
    if (!buyer) return showModal("Enter buyer name!");

    const billItems = [];
    document.querySelectorAll(".bill-item").forEach(div => {
      const name = div.querySelector(".bill-item-name").textContent;
      const price = parseFloat(div.querySelector(".bill-item-price").textContent.replace("₹", ""));
      const qty = parseFloat(div.querySelector(".bill-item-qty").value) || 0;
      if (qty > 0) {
        billItems.push({ name, price, qty, total: price * qty });
      }
    });

    const total = billItems.reduce((sum, item) => sum + item.total, 0);

    const bill = { buyer, items: billItems, total, date: new Date().toLocaleString() };
    buyers.push(bill);
    localStorage.setItem("buyers", JSON.stringify(buyers));

    totalAmountEl.textContent = `₹${total}`;
    renderBuyers();
    showModal(`Bill generated for ${buyer}, Total: ₹${total}`);
  });
}

function renderBillItems() {
  if (!billItemsDiv) return;
  billItemsDiv.innerHTML = "";
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "bill-item";
    div.innerHTML = `
      <span class="bill-item-name">${item.name}</span> -
      <span class="bill-item-price">₹${item.price}</span>
      × <input type="number" class="bill-item-qty" min="0" value="0">
    `;
    billItemsDiv.appendChild(div);
  });
}
renderBillItems();

/* ================= BUYER RECORDS ================= */
const buyersTableBody = document.querySelector("#buyers-table tbody");
const searchBar = document.getElementById("search-bar");

function renderBuyers() {
  if (!buyersTableBody) return;
  buyersTableBody.innerHTML = "";
  buyers.forEach(bill => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${bill.buyer}</td>
      <td>${bill.date}</td>
      <td>₹${bill.total}</td>
      <td><button class="btn-secondary" onclick="viewBill('${bill.buyer}', '${bill.date}')">View</button></td>
    `;
    buyersTableBody.appendChild(row);
  });
}
renderBuyers();

if (searchBar) {
  searchBar.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    buyersTableBody.innerHTML = "";
    buyers
      .filter(b => b.buyer.toLowerCase().includes(q))
      .forEach(bill => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${bill.buyer}</td>
          <td>${bill.date}</td>
          <td>₹${bill.total}</td>
          <td><button class="btn-secondary" onclick="viewBill('${bill.buyer}', '${bill.date}')">View</button></td>
        `;
        buyersTableBody.appendChild(row);
      });
  });
}

function viewBill(buyer, date) {
  const bill = buyers.find(b => b.buyer === buyer && b.date === date);
  if (!bill) return;
  let details = `<h3>Bill for ${bill.buyer}</h3><p>${bill.date}</p><ul>`;
  bill.items.forEach(i => {
    details += `<li>${i.name} - ${i.qty} kg × ₹${i.price} = ₹${i.total}</li>`;
  });
  details += `</ul><strong>Total: ₹${bill.total}</strong>`;
  showModal(details);
}

/* ================= MODAL ================= */
function showModal(content) {
  const overlay = document.getElementById("modal-overlay");
  const body = document.getElementById("modal-body");
  if (!overlay || !body) return;
  body.innerHTML = content;
  overlay.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

/* ================= DASHBOARD CHART ================= */
window.onload = function () {
  const ctx = document.getElementById("sales-chart");
  if (ctx) {
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Rice", "Dal", "Sugar", "Oil"],
        datasets: [{
          label: "Sales",
          data: [12, 19, 7, 14],
          backgroundColor: ["#20e3b2", "#8a4fff", "#4facfe", "#20e3b2"]
        }]
      }
    });
  }
};
