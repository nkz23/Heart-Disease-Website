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
