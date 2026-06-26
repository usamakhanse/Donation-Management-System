// Safe helpers
function byId(id) {
  return document.getElementById(id);
}

function on(el, event, handler) {
  if (!el) return;
  el.addEventListener(event, handler);
}

// Elements (may not exist on every page)
let loginPage = byId("loginPage");
let mainWebsite = byId("mainWebsite");

// Show Signup
on(byId("showSignup"), "click", function () {
  const signupForm = byId("signupForm");
  if (signupForm) signupForm.style.display = "block";
});

// Signup
on(byId("signupForm"), "submit", function (e) {
  e.preventDefault();

  let email = byId("signupEmail")?.value || "";
  let password = byId("signupPassword")?.value || "";

  localStorage.setItem("email", email);
  localStorage.setItem("password", password);

  alert("Signup Successful");
});

// Login
on(byId("loginForm"), "submit", function (e) {
  e.preventDefault();

  let email = byId("loginEmail")?.value || "";
  let password = byId("loginPassword")?.value || "";

  let savedEmail = localStorage.getItem("email");
  let savedPassword = localStorage.getItem("password");

  if (email === savedEmail && password === savedPassword) {
    localStorage.setItem("loggedIn", "true");

    if (loginPage) loginPage.style.display = "none";
    if (mainWebsite) mainWebsite.style.display = "block";
  } else {
    alert("Invalid Email or Password");
  }
});

// Keep user logged-in view on home page refresh
function syncAuthUI() {
  if (!mainWebsite) return;

  // Non-home pages don't have login UI; always show main content there.
  if (!loginPage) {
    mainWebsite.style.display = "block";
    return;
  }

  // Home page has login + main sections.
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  loginPage.style.display = loggedIn ? "none" : "flex";
  mainWebsite.style.display = loggedIn ? "block" : "none";
}

// Donation System
let totalDonation = Number(localStorage.getItem("totalDonation") || "0");
let target = 10000;

// Demo bank options
const bankOptions = {
  // Local Pakistan wallets
  local: ["JazzCash", "Easypaisa", "NayaPay"],
  // International methods
  international: ["PayPal", "Stripe", "Wise", "WorldRemit", "Revolut"],
};

function populateBankNames(type, preserveValue) {
  const bankNameSelect = byId("bankName");
  if (!bankNameSelect) return;

  bankNameSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select Bank";
  bankNameSelect.appendChild(placeholder);

  const list = bankOptions[type] || [];
  list.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    bankNameSelect.appendChild(opt);
  });

  if (preserveValue && list.includes(preserveValue)) {
    bankNameSelect.value = preserveValue;
  }
}

// Donate page: bank selector (local/international + filtered bank list)
function setupBankSelector() {
  const bankTypeSelect = byId("bankType");
  const bankNameSelect = byId("bankName");
  if (!bankTypeSelect || !bankNameSelect) return;

  // Restore from storage
  const storedType = localStorage.getItem("selectedBankType") || "";
  const storedBank = localStorage.getItem("selectedBank") || "";

  if (storedType) {
    populateBankNames(storedType, storedBank);
    bankTypeSelect.value = storedType;
  }

  bankTypeSelect.addEventListener("change", () => {
    const type = bankTypeSelect.value;
    localStorage.setItem("selectedBankType", type || "");

    // Clear bank selection whenever type changes
    localStorage.setItem("selectedBank", "");
    populateBankNames(type, "");
  });

  bankNameSelect.addEventListener("change", () => {
    localStorage.setItem("selectedBank", bankNameSelect.value || "");
  });
}

function renderDonation() {
  const totalEl = byId("total");
  if (totalEl) totalEl.innerText = String(totalDonation);

  const progressBar = byId("progressBar");
  if (progressBar) {
    let progress = (totalDonation / target) * 100;
    if (progress > 100) progress = 100;
    progressBar.style.width = progress + "%";
  }
}

// Select Campaign (used in older single-page; keep for compatibility)
function selectCampaign(name) {
  const campaignInput = byId("campaign");
  if (campaignInput) campaignInput.value = name;
}
window.selectCampaign = selectCampaign;

// Campaign page: auto go to donate page when selecting campaign
function setupCampaignRedirect() {
  const buttons = document.querySelectorAll("[data-campaign]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const campaign = btn.getAttribute("data-campaign") || "";
      localStorage.setItem("selectedCampaign", campaign);
      window.location.href = "donate.html";
    });
  });
}

// Donate form
on(byId("donateForm"), "submit", function (e) {
  e.preventDefault();

  let name = byId("name")?.value || "";
  let amount = parseInt(byId("amount")?.value || "0", 10);
  let bank = byId("bankName")?.value || "";

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  if (!bank) {
    alert("Please select a bank option.");
    return;
  }

  totalDonation += amount;
  localStorage.setItem("totalDonation", String(totalDonation));

  renderDonation();

  const message = byId("message");
  if (message) message.innerText = "Thank you " + name + " via " + bank + " ❤️";

  const form = byId("donateForm");
  if (form) form.reset();

  // Keep selected campaign after reset
  const selected = localStorage.getItem("selectedCampaign") || "";
  const campaignInput = byId("campaign");
  if (campaignInput) campaignInput.value = selected;

  // Keep selected bank after reset
  const storedType = localStorage.getItem("selectedBankType") || "";
  const storedBank = localStorage.getItem("selectedBank") || "";
  const bankTypeSelect = byId("bankType");
  if (bankTypeSelect) {
    if (storedType) {
      populateBankNames(storedType, storedBank);
      bankTypeSelect.value = storedType;
    }
  }
});

// Auto-fill campaign on donate page
function fillSelectedCampaign() {
  const campaignInput = byId("campaign");
  if (!campaignInput) return;
  const selected = localStorage.getItem("selectedCampaign") || "";
  campaignInput.value = selected;
}

// Donate page: keep selected campaign in storage while selecting
function setupCampaignPickerPersistence() {
  const campaignInput = byId("campaign");
  if (!campaignInput) return;

  campaignInput.addEventListener("change", () => {
    localStorage.setItem("selectedCampaign", campaignInput.value || "");
  });
}

// Donate page: filter campaigns in the selector
function setupCampaignFilter() {
  const filterInput = byId("campaignFilter");
  const campaignSelect = byId("campaign");
  if (!filterInput || !campaignSelect) return;

  const allOptions = Array.from(campaignSelect.options).map((opt) => ({
    value: opt.value,
    text: opt.text,
    isPlaceholder: opt.value === "",
  }));

  function renderOptions(query) {
    const q = (query || "").trim().toLowerCase();

    // Clear existing options
    campaignSelect.innerHTML = "";

    // Always keep placeholder on top
    const placeholder = allOptions.find((o) => o.isPlaceholder);
    if (placeholder) {
      const opt = document.createElement("option");
      opt.value = placeholder.value;
      opt.textContent = placeholder.text;
      campaignSelect.appendChild(opt);
    }

    allOptions
      .filter((o) => !o.isPlaceholder)
      .filter((o) => (q ? o.text.toLowerCase().includes(q) : true))
      .forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.text;
        campaignSelect.appendChild(opt);
      });
  }

  // Initial render
  renderOptions(filterInput.value);

  // Filter while typing
  filterInput.addEventListener("input", () => {
    const current = localStorage.getItem("selectedCampaign") || "";
    renderOptions(filterInput.value);
    // try to keep selection if still available
    campaignSelect.value = current;
  });
}

// Dark Mode
function applyThemeFromStorage() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

on(byId("modeBtn"), "click", function () {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Logout
on(byId("logoutBtn"), "click", function () {
  localStorage.setItem("loggedIn", "false");

  if (loginPage && mainWebsite) {
    loginPage.style.display = "flex";
    mainWebsite.style.display = "none";
  } else {
    // If user logs out from other page, go back to home
    window.location.href = "index.html";
  }
});

// Mobile menu
on(byId("menuBtn"), "click", function () {
  const navLinks = byId("navLinks");
  if (!navLinks) return;
  const open = navLinks.classList.toggle("open");
  const menuBtn = byId("menuBtn");
  if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
});

// Contact demo submit
on(byId("contactForm"), "submit", function (e) {
  e.preventDefault();
  const status = byId("contactStatus");
  if (status) status.textContent = "Message sent successfully (demo).";
  byId("contactForm")?.reset();
});

// Boot
applyThemeFromStorage();
syncAuthUI();
setupCampaignRedirect();
fillSelectedCampaign();
setupCampaignPickerPersistence();
setupCampaignFilter();
setupBankSelector();
renderDonation();

