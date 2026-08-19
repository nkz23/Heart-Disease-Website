// Base URL pointing to public Ngrok Flask API instance running in Colab
const COLAB_BASE_URL = "https://xxxx-xx-xxx-xxx-xxx.ngrok-free.app"; // Replace with active Ngrok URL
let isDatabaseOnline = false;

document.addEventListener("DOMContentLoaded", () => {
  // Navigation trigger bindings
  document.getElementById("btn-check-risk")?.addEventListener("click", () => {
    switchPage("page-home", "page-form", 800);
  });

  document.getElementById("btn-find-cardiologist-home")?.addEventListener("click", () => {
    switchPage("page-home", "page-routing", 800);
  });

  document.getElementById("btn-find-care-analysis")?.addEventListener("click", () => {
    switchPage("page-analysis", "page-routing", 600);
  });

  // Setup real-time dynamic validation on form inputs
  setupRealtimeValidation();

  // Handle Form Submission (Single unified listener)
  const form = document.getElementById("risk-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (validateForm()) {
        calculateAndDisplayRisk();
        await processAndSaveFormData();
        switchPage("page-form", "page-analysis", 1000);
      }
    });
  }

  // Database Connection Health Check & Periodic Ping
  checkDatabaseStatus();
  setInterval(checkDatabaseStatus, 10000);
});

/**
 * Transitions between views with simulated loading progress
 */
function switchPage(fromPageId, toPageId, delayMs = 1000) {
  const loadingScreen = document.getElementById("loading-screen");
  const progressBar = document.getElementById("progress-bar");
  const statusText = document.getElementById("loading-status");

  if (!loadingScreen) return;

  loadingScreen.classList.remove("hidden");
  let progress = 0;
  const intervalTime = 20;
  const step = 100 / (delayMs / intervalTime);

  const timer = setInterval(() => {
    progress += step;
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);

      const fromElem = document.getElementById(fromPageId);
      const toElem = document.getElementById(toPageId);

      if (fromElem) {
        fromElem.classList.add("hidden");
        fromElem.classList.remove("active");
      }

      if (toElem) {
        toElem.classList.remove("hidden");
        toElem.classList.add("active");
      }

      setTimeout(() => {
        loadingScreen.classList.add("hidden");
        if (progressBar) progressBar.style.width = "0%";
      }, 150);
    }
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (statusText) statusText.innerText = `${Math.round(progress)}% • CALIBRATING`;
  }, intervalTime);
}

/**
 * Real-time verification for whitespace, invalid values, and formatting errors
 */
function setupRealtimeValidation() {
  const inputs = document.querySelectorAll("#risk-form input, #risk-form select");
  inputs.forEach(input => {
    input.addEventListener("input", () => validateField(input));
    input.addEventListener("blur", () => validateField(input));
  });
}

function validateField(input) {
  const errSpan = document.getElementById(`err-${input.id}`);
  let rawValue = input.value;

  if (typeof rawValue === 'string') {
    rawValue = rawValue.trim();
  }

  if (!errSpan) return true;

  if (input.hasAttribute("required") && rawValue === "") {
    showFieldError(input, errSpan, "Field required");
    return false;
  }

  if (input.type === "number") {
    const val = parseFloat(rawValue);
    const min = parseFloat(input.getAttribute("min"));
    const max = parseFloat(input.getAttribute("max"));

    if (isNaN(val)) {
      showFieldError(input, errSpan, "Invalid number");
      return false;
    }
    if (min !== null && val < min) {
      showFieldError(input, errSpan, `Min value is ${min}`);
      return false;
    }
    if (max !== null && val > max) {
      showFieldError(input, errSpan, `Max value is ${max}`);
      return false;
    }
  }

  clearFieldError(input, errSpan);
  return true;
}

function showFieldError(input, errSpan, msg) {
  input.classList.add("invalid");
  errSpan.innerText = msg;
}

function clearFieldError(input, errSpan) {
  input.classList.remove("invalid");
  errSpan.innerText = "";
}

function validateForm() {
  const inputs = document.querySelectorAll("#risk-form input[required], #risk-form select[required]");
  let isValid = true;
  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });
  return isValid;
}

/**
 * Internal risk estimation heuristic based on input clinical markers
 */
function calculateAndDisplayRisk() {
  const age = parseFloat(document.getElementById("age")?.value) || 50;
  const chol = parseFloat(document.getElementById("chol")?.value) || 200;
  const trestbps = parseFloat(document.getElementById("trestbps")?.value) || 120;
  const oldpeak = parseFloat(document.getElementById("oldpeak")?.value) || 0;

  let calculatedRisk = Math.round(((age / 100) * 0.3 + (chol / 400) * 0.3 + (trestbps / 200) * 0.2 + (oldpeak / 5) * 0.2) * 100);
  calculatedRisk = Math.min(Math.max(calculatedRisk, 5), 95);

  const scoreDisplay = document.getElementById("risk-score-display");
  const overallDisplay = document.getElementById("overall-val");
  if (scoreDisplay) scoreDisplay.innerText = `${calculatedRisk}%`;
  if (overallDisplay) overallDisplay.innerText = `${calculatedRisk}%`;

  const dietElem = document.getElementById("diet-guideline");
  const exerciseElem = document.getElementById("exercise-guideline");
  const stageElem = document.getElementById("risk-stage-display");

  if (calculatedRisk > 50) {
    if (stageElem) stageElem.innerText = "HIGH RISK • STAGE III";
    if (dietElem) dietElem.innerText = "Strict low-sodium (<1,500 mg/day), zero trans-fats, strict glycemic control.";
    if (exerciseElem) exerciseElem.innerText = "Low-impact supervised walking only. Clearance required before higher exertive stress.";
  } else if (calculatedRisk > 25) {
    if (stageElem) stageElem.innerText = "MODERATE RISK • STAGE II";
    if (dietElem) dietElem.innerText = "Reduce sodium intake to < 2,000 mg/day, limit saturated fats, eliminate trans fats.";
    if (exerciseElem) exerciseElem.innerText = "Moderate aerobic exercise 150 mins/week. Avoid sudden heavy resistance training without clearance.";
  } else {
    if (stageElem) stageElem.innerText = "LOW RISK • STAGE I";
    if (dietElem) dietElem.innerText = "Maintain balanced Mediterranean diet high in whole grains, legumes, and omega-3 fats.";
    if (exerciseElem) exerciseElem.innerText = "Regular cardiovascular training 150–300 mins/week with strength training 2 days/week.";
  }
}

/**
 * Reads form data, computes target diagnosis, and structures Cleveland dataset payload
 */
async function processAndSaveFormData() {
  const age = parseFloat(document.getElementById("age")?.value) || 0;
  const trestbps = parseFloat(document.getElementById("trestbps")?.value) || 0;
  const chol = parseFloat(document.getElementById("chol")?.value) || 0;
  const thalach = parseFloat(document.getElementById("thalach")?.value) || 0;
  const oldpeak = parseFloat(document.getElementById("oldpeak")?.value) || 0;

  const sex = parseInt(document.getElementById("sex")?.value) || 0;
  const cp = parseInt(document.getElementById("cp")?.value) || 0;
  const restecg = parseInt(document.getElementById("restecg")?.value) || 0;
  const slope = parseInt(document.getElementById("slope")?.value) || 0;
  const ca = parseInt(document.getElementById("ca")?.value) || 0;
  const thal = parseInt(document.getElementById("thal")?.value) || 0;

  const fbs = document.getElementById("fbs")?.checked ? 1 : 0;
  const exang = document.getElementById("exang")?.checked ? 1 : 0;

  let calculatedRisk = Math.round(
    ((age / 100) * 0.2 + (chol / 400) * 0.25 + (trestbps / 200) * 0.25 + (oldpeak / 5) * 0.3) * 100
  );
  calculatedRisk = Math.min(Math.max(calculatedRisk, 1), 99);
  const target = calculatedRisk >= 50 ? 1 : 0;

  const patientRecord = {
    age, sex, cp, trestbps, chol, fbs,
    restecg, thalach, exang, oldpeak, slope, ca, thal,
    target: target,
    timestamp: new Date().toISOString()
  };

  await savePatientRecord(patientRecord);
}

/**
 * Saves patient record to GitHub repository CSV backend via Colab Flask API
 */
async function savePatientRecord(patientData) {
  try {
    const response = await fetch(`${COLAB_BASE_URL}/api/record-patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData)
    });

    if (response.ok) {
      showToast("Data successfully saved to GitHub CSV!");
      return true;
    } else {
      throw new Error("Server response error");
    }
  } catch (error) {
    console.warn("API offline. Caching entry locally...", error);
    saveLocally(patientData);
    showToast("Server offline: Data cached locally.");
    return false;
  }
}

/**
 * Fallback: Cache unsaved entries in localStorage
 */
function saveLocally(data) {
  let pendingRecords = JSON.parse(localStorage.getItem("pending_cardiac_records") || "[]");
  pendingRecords.push(data);
  localStorage.setItem("pending_cardiac_records", JSON.stringify(pendingRecords));
  enableUnsavedWarning();
}

/**
 * Warns user if attempting to leave or reload page with unsaved local entries
 */
function enableUnsavedWarning() {
  window.onbeforeunload = function (e) {
    const pending = JSON.parse(localStorage.getItem("pending_cardiac_records") || "[]");
    if (pending.length > 0) {
      const msg = "You have unsaved clinical records stored locally. Reloading may erase unsaved data.";
      e.returnValue = msg;
      return msg;
    }
  };
}

/**
 * Periodically checks Flask backend database status
 */
async function checkDatabaseStatus() {
  try {
    const response = await fetch(`${COLAB_BASE_URL}/api/health`, { method: "GET" });
    if (response.ok) {
      updateStatusPills(true);
      if (!isDatabaseOnline) {
        syncOfflineRecords();
      }
      isDatabaseOnline = true;
    } else {
      updateStatusPills(false);
      isDatabaseOnline = false;
    }
  } catch (err) {
    updateStatusPills(false);
    isDatabaseOnline = false;
  }
}

/**
 * Updates status pills across views to reflect active backend state
 */
function updateStatusPills(online) {
  const statusPills = [
    document.getElementById("db-status-home"),
    document.getElementById("db-status-analysis")
  ];

  statusPills.forEach(pill => {
    if (!pill) return;
    
    if (online) {
      pill.className = "status-pill active-db";
      pill.innerHTML = `<span class="dot green-dot"></span> GITHUB CSV • ACTIVE DATABASE`;
    } else {
      pill.className = "status-pill offline-db";
      pill.innerHTML = `<span class="dot yellow-dot"></span> LOCAL CACHE • DATABASE OFFLINE`;
    }
  });
}

/**
 * Syncs unsaved records stored in localStorage when API connection recovers
 */
async function syncOfflineRecords() {
  const pendingRecords = JSON.parse(localStorage.getItem("pending_cardiac_records") || "[]");
  if (pendingRecords.length === 0) return;

  console.log(`Syncing ${pendingRecords.length} offline records to GitHub CSV...`);
  
  const remainingRecords = [];
  for (const record of pendingRecords) {
    try {
      const res = await fetch(`${COLAB_BASE_URL}/api/record-patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
      if (!res.ok) remainingRecords.push(record);
    } catch (e) {
      remainingRecords.push(record);
    }
  }

  localStorage.setItem("pending_cardiac_records", JSON.stringify(remainingRecords));
  if (remainingRecords.length === 0) {
    window.onbeforeunload = null;
  }
}

/**
 * Displays temporary popup toast message
 */
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  const msgElem = document.getElementById("toast-message");

  if (!toast || !msgElem) return;

  msgElem.innerText = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}

/**
 * Care Routing: Opens Google Maps search centered on user location or fallback
 */
function openNearbyHospitals(queryType) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(queryType)}/@${lat},${lng},14z`, '_blank');
      },
      () => {
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(queryType)}+near+me`, '_blank');
      }
    );
  } else {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(queryType)}+near+me`, '_blank');
  }
}

/**
 * Care Routing: Connects to National Emergency & Inquiry services
 */
function connectNationalEmergency() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = "tel:1990";
  } else {
    alert("Emergency Service: Call 1990 (National Pre-Hospital Emergency Hotline) or contact your nearest emergency room immediately.");
  }
}
