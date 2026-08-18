document.addEventListener("DOMContentLoaded", () => {
  // Navigation trigger bindings
  document.getElementById("btn-check-risk").addEventListener("click", () => {
    switchPage("page-home", "page-form", 800);
  });

  document.getElementById("btn-find-cardiologist-home").addEventListener("click", () => {
    switchPage("page-home", "page-routing", 800);
  });

  document.getElementById("btn-find-care-analysis").addEventListener("click", () => {
    switchPage("page-analysis", "page-routing", 600);
  });

  // Setup real-time dynamic validation on form inputs
  setupRealtimeValidation();

  // Handle Form Submission
  const form = document.getElementById("risk-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateForm()) {
      calculateAndDisplayRisk();
      switchPage("page-form", "page-analysis", 1200);
    }
  });
});

/**
 * Transitions between views with simulated loading progress
 */
function switchPage(fromPageId, toPageId, delayMs = 1000) {
  const loadingScreen = document.getElementById("loading-screen");
  const progressBar = document.getElementById("progress-bar");
  const statusText = document.getElementById("loading-status");

  loadingScreen.classList.remove("hidden");
  let progress = 0;
  const intervalTime = 20;
  const step = 100 / (delayMs / intervalTime);

  const timer = setInterval(() => {
    progress += step;
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);

      document.getElementById(fromPageId).classList.add("hidden");
      document.getElementById(fromPageId).classList.remove("active");

      document.getElementById(toPageId).classList.remove("hidden");
      document.getElementById(toPageId).classList.add("active");

      setTimeout(() => {
        loadingScreen.classList.add("hidden");
        progressBar.style.width = "0%";
      }, 150);
    }
    progressBar.style.width = `${progress}%`;
    statusText.innerText = `${Math.round(progress)}% • CALIBRATING`;
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

  // Real-time Trim Whitespaces
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
  const age = parseFloat(document.getElementById("age").value) || 50;
  const chol = parseFloat(document.getElementById("chol").value) || 200;
  const trestbps = parseFloat(document.getElementById("trestbps").value) || 120;
  const oldpeak = parseFloat(document.getElementById("oldpeak").value) || 0;

  // Basic diagnostic model calculation for risk estimation
  let calculatedRisk = Math.round(((age / 100) * 0.3 + (chol / 400) * 0.3 + (trestbps / 200) * 0.2 + (oldpeak / 5) * 0.2) * 100);
  calculatedRisk = Math.min(Math.max(calculatedRisk, 5), 95);

  document.getElementById("risk-score-display").innerText = `${calculatedRisk}%`;
  document.getElementById("overall-val").innerText = `${calculatedRisk}%`;

  // Dynamically update recommendations according to risk level
  const dietElem = document.getElementById("diet-guideline");
  const exerciseElem = document.getElementById("exercise-guideline");
  const stageElem = document.getElementById("risk-stage-display");

  if (calculatedRisk > 50) {
    stageElem.innerText = "HIGH RISK • STAGE III";
    dietElem.innerText = "Strict low-sodium (<1,500 mg/day), zero trans-fats, strict glycemic control.";
    exerciseElem.innerText = "Low-impact supervised walking only. Clearance required before higher exertive stress.";
  } else if (calculatedRisk > 25) {
    stageElem.innerText = "MODERATE RISK • STAGE II";
    dietElem.innerText = "Reduce sodium intake to < 2,000 mg/day, limit saturated fats, eliminate trans fats.";
    exerciseElem.innerText = "Moderate aerobic exercise 150 mins/week. Avoid sudden heavy resistance training without clearance.";
  } else {
    stageElem.innerText = "LOW RISK • STAGE I";
    dietElem.innerText = "Maintain balanced Mediterranean diet high in whole grains, legumes, and omega-3 fats.";
    exerciseElem.innerText = "Regular cardiovascular training 150–300 mins/week with strength training 2 days/week.";
  }
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
        // Fallback to query without exact coordinates
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
    // Direct dispatch to national medical emergency hotline
    window.location.href = "tel:1990";
  } else {
    alert("Emergency Service: Call 1990 (National Pre-Hospital Emergency Hotline) or contact your nearest emergency room immediately.");
  }
}



// Replace with the public Ngrok URL printed in your Google Colab console
const COLAB_API_URL = "https://irregular-fled-fastball.ngrok-free.dev/api/record-patient";


// Function to append a new patient record
async function savePatientRecord(patientData) {
  try {
    // Attempt to send record to Google Drive via Colab Flask API
    const response = await fetch(COLAB_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData)
    });

    if (response.ok) {
      console.log("Entry successfully appended to Google Drive CSV.");
      return true;
    } else {
      throw new Error("Server error or CSV unlinked");
    }
  } catch (error) {
    console.warn("Colab API unavailable. Saving record locally...", error);
    saveLocally(patientData);
    return false;
  }
}

// Fallback: Save unsaved entries to browser localStorage
function saveLocally(data) {
  let pendingRecords = JSON.parse(localStorage.getItem("pending_cardiac_records") || "[]");
  pendingRecords.push(data);
  localStorage.setItem("pending_cardiac_records", JSON.stringify(pendingRecords));
  
  // Enable warning prompt before tab close/reload
  enableUnsavedWarning();
}

// Warn user if reloading/closing while unsaved data exists
function enableUnsavedWarning() {
  window.onbeforeunload = function (e) {
    const pending = JSON.parse(localStorage.getItem("pending_cardiac_records") || "[]");
    if (pending.length > 0) {
      const msg = "You have unsaved clinical records stored locally. If you reload or leave without connecting to the CSV server, this data will be erased.";
      e.returnValue = msg;
      return msg;
    }
  };
}


const COLAB_BASE_URL = "https://your-ngrok-subdomain.ngrok-free.app";
let isDatabaseOnline = false;

document.addEventListener("DOMContentLoaded", () => {
  // Initial check on page load and periodic ping every 10 seconds
  checkDatabaseStatus();
  setInterval(checkDatabaseStatus, 10000);

  // ... rest of your event listeners ...
});

/**
 * Checks if the Colab Flask server is online and updates status pills
 */
async function checkDatabaseStatus() {
  try {
    const response = await fetch(`${COLAB_BASE_URL}/api/health`, { method: "GET" });
    if (response.ok) {
      updateStatusPills(true);
      if (!isDatabaseOnline) {
        // If coming back online, sync any unsaved offline entries
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
 * Updates status pills across views to reflect current active state
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
      pill.innerHTML = `<span class="dot green-dot"></span> GOOGLE DRIVE CSV • ACTIVE DATABASE`;
    } else {
      pill.className = "status-pill offline-db";
      pill.innerHTML = `<span class="dot yellow-dot"></span> LOCAL CACHE • DATABASE OFFLINE`;
    }
  });
}

/**
 * Syncs unsaved records stored in localStorage when database reconnects
 */
async function syncOfflineRecords() {
  const pendingRecords = JSON.parse(localStorage.getItem("pending_cardiac_records") || "[]");
  if (pendingRecords.length === 0) return;

  console.log(`Syncing ${pendingRecords.length} offline records to Google Drive CSV...`);
  
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
    window.onbeforeunload = null; // Clear unsaved warning prompt
  }
}
