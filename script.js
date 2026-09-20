// =============================================================
// 1. PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
//    (see the setup instructions provided alongside this file)
// =============================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYroI2ej7ufrmOVZGXoeLcvfeVwu3nX4foDQjuwK9LvwLGCeb8qf3ovXzW0qvjbBzumQ/exec";

const form = document.getElementById("rsvp-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");
const submitText = document.getElementById("submit-text");
const guestCountInput = document.getElementById("guestCount");

// Keep the hidden guestCount input in sync with the attending choice:
// 1 if joyfully accepting, 0 if regretfully declining.
form.querySelectorAll('input[name="attending"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    guestCountInput.value = radio.value === "Joyfully accepts" ? "1" : "0";
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("", null);

  const formData = new FormData(form);
  const payload = {
    fullName: formData.get("fullName")?.trim() || "",
    email: formData.get("email")?.trim() || "",
    attending: formData.get("attending") || "",
    guestCount: formData.get("guestCount") || "0",
    submittedAt: new Date().toISOString(),
  };

  if (!payload.fullName || !payload.email || !payload.attending) {
    setStatus("Please fill in your name, email, and RSVP choice.", "error");
    return;
  }

  if (SCRIPT_URL.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE")) {
    setStatus("Form isn't connected to Google Sheets yet — see setup instructions.", "error");
    return;
  }

  setSubmitting(true);

  try {
    // Apps Script doesn't reliably send CORS headers back, so the browser
    // won't let us read the response even when the request succeeds.
    // "no-cors" sends the request but returns an opaque response we can't
    // inspect — a thrown error here means the request itself failed
    // (bad URL, no network, etc.), not that the sheet rejected it.
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    form.reset();
    guestCountInput.value = "0";
    setStatus("Thank you — your RSVP has been received.", "success");
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong sending your RSVP. Please try again.", "error");
  } finally {
    setSubmitting(false);
  }
});

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  submitText.textContent = isSubmitting ? "Sending…" : "Send RSVP";
}

function setStatus(message, state) {
  statusEl.textContent = message;
  if (state) {
    statusEl.dataset.state = state;
  } else {
    delete statusEl.dataset.state;
  }
}
