import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = id => document.getElementById(id);

let customers = [];
let jobs = [];

const today = new Date();
const localDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

$("calendarDate").value = localDate(today);
$("jobDate").value = localDate(today);

$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  $("loginError").textContent = "";

  try {
    await signInWithEmailAndPassword(
      auth,
      $("email").value.trim(),
      $("password").value
    );
  } catch (error) {
    $("loginError").textContent = "Login failed. Check your email and password.";
  }
});

$("logoutBtn").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async user => {
  $("loginPanel").classList.toggle("hidden", !!user);
  $("crmApp").classList.toggle("hidden", !user);

  if (user) {
    $("employeeEmail").textContent = user.email;
    await refreshData();
  }
});

async function refreshData() {
  const customerSnapshot = await getDocs(
    query(collection(db, "customers"), orderBy("name"))
  );

  customers = customerSnapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));

  const jobSnapshot = await getDocs(
    query(collection(db, "jobs"), orderBy("date"))
  );

  jobs = jobSnapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));

  renderCustomers();
  renderCustomerOptions();
  renderJobs();
  renderDashboard();
}

$("customerForm").addEventListener("submit", async event => {
  event.preventDefault();

  await addDoc(collection(db, "customers"), {
    name: $("customerName").value.trim(),
    phone: $("customerPhone").value.trim(),
    address: $("customerAddress").value.trim(),
    email: $("customerEmail").value.trim(),
    createdAt: new Date().toISOString()
  });

  event.target.reset();
  await refreshData();
});

$("jobForm").addEventListener("submit", async event => {
  event.preventDefault();

  const customer = customers.find(c => c.id === $("jobCustomer").value);
  if (!customer) return;

  await addDoc(collection(db, "jobs"), {
    customerId: customer.id,
    customerName: customer.name,
    date: $("jobDate").value,
    description: $("jobDescription").value.trim(),
    price: Number($("jobPrice").value),
    notes: $("jobNotes").value.trim(),
    completed: false,
    paid: false,
    createdAt: new Date().toISOString()
  });

  $("jobDescription").value = "";
  $("jobPrice").value = "";
  $("jobNotes").value = "";

  await refreshData();
});

$("calendarDate").addEventListener("change", renderJobs);

$("customerList").addEventListener("click", async event => {
  const button = event.target.closest("[data-delete-customer]");
  if (!button) return;

  const id = button.dataset.deleteCustomer;
  const hasJobs = jobs.some(job => job.customerId === id);

  if (hasJobs) {
    alert("This customer has jobs. Delete or reassign those jobs before deleting the customer.");
    return;
  }

  if (!confirm("Delete this customer?")) return;

  await deleteDoc(doc(db, "customers", id));
  await refreshData();
});

document.addEventListener("click", async event => {
  const completeButton = event.target.closest("[data-complete]");
  const paidButton = event.target.closest("[data-paid]");
  const deleteButton = event.target.closest("[data-delete-job]");

  if (completeButton) {
    const job = jobs.find(item => item.id === completeButton.dataset.complete);
    await updateDoc(doc(db, "jobs", job.id), {
      completed: !job.completed
    });
    await refreshData();
  }

  if (paidButton) {
    const job = jobs.find(item => item.id === paidButton.dataset.paid);
    await updateDoc(doc(db, "jobs", job.id), {
      paid: !job.paid
    });
    await refreshData();
  }

  if (deleteButton) {
    if (!confirm("Delete this job?")) return;
    await deleteDoc(doc(db, "jobs", deleteButton.dataset.deleteJob));
    await refreshData();
  }
});

document.querySelectorAll(".crm-nav button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".crm-nav button").forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    ["dashboard", "calendar", "customers"].forEach(tab => {
      $(tab + "Tab").classList.toggle("hidden", tab !== button.dataset.tab);
    });
  });
});

function renderCustomerOptions() {
  $("jobCustomer").innerHTML =
    '<option value="">Select customer</option>' +
    customers.map(customer =>
      `<option value="${customer.id}">${escapeHTML(customer.name)}</option>`
    ).join("");
}

function renderCustomers() {
  $("customerList").innerHTML = customers.length
    ? customers.map(customer => `
      <div class="job">
        <div>
          <strong>${escapeHTML(customer.name)}</strong>
          <div class="muted">${escapeHTML(customer.phone || "No phone number")}</div>
          <div class="muted">${escapeHTML(customer.address || "No address")}</div>
          <div class="muted">${escapeHTML(customer.email || "")}</div>
        </div>
        <div class="job-actions">
          <button class="delete-btn" data-delete-customer="${customer.id}">Delete</button>
        </div>
      </div>
    `).join("")
    : '<p class="muted">No customers added yet.</p>';

  $("customerCount").textContent = customers.length;
}

function renderJobs() {
  const selectedDate = $("calendarDate").value;
  const selected = jobs.filter(job => job.date === selectedDate);

  $("selectedJobs").innerHTML = `
    <h3>${selected.length} job(s) scheduled</h3>
    ${selected.length ? selected.map(jobHTML).join("") : '<p class="muted">No jobs scheduled for this day.</p>'}
  `;
}

function jobHTML(job) {
  return `
    <div class="job ${job.completed ? "completed" : ""}">
      <div>
        <strong>${escapeHTML(job.customerName)}</strong>
        <div>${escapeHTML(job.description)}</div>
        <div class="muted">${escapeHTML(job.notes || "")}</div>
        <strong>$${Number(job.price).toFixed(2)}</strong>
        <div class="muted">
          ${job.completed ? "Completed" : "Not completed"} ·
          ${job.paid ? "Paid" : "Payment outstanding"}
        </div>
      </div>
      <div class="job-actions">
        <button class="complete-btn" data-complete="${job.id}">
          ${job.completed ? "Undo Complete" : "Complete"}
        </button>
        <button class="complete-btn" data-paid="${job.id}">
          ${job.paid ? "Undo Paid" : "Mark Paid"}
        </button>
        <button class="delete-btn" data-delete-job="${job.id}">Delete</button>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const todayString = localDate(new Date());
  const todayJobs = jobs.filter(job => job.date === todayString);
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartString = localDate(weekStart);

  const todayRevenue = todayJobs
    .filter(job => job.completed)
    .reduce((sum, job) => sum + Number(job.price || 0), 0);

  const weekRevenue = jobs
    .filter(job => job.completed && job.date >= weekStartString && job.date <= todayString)
    .reduce((sum, job) => sum + Number(job.price || 0), 0);

  $("todayCount").textContent = todayJobs.length;
  $("todayRevenue").textContent = money(todayRevenue);
  $("weekRevenue").textContent = money(weekRevenue);
  $("todayJobs").innerHTML = todayJobs.length
    ? todayJobs.map(jobHTML).join("")
    : '<p class="muted">No jobs scheduled today.</p>';
}

function money(amount) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}
