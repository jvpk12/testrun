// =============================================================
// 1. PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
//    (see the setup instructions provided alongside this file)
// =============================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBGZGCciLJaC1sbWs1FbYExIdL7HNUHWAKY9oj147qzIqn9wwC8-QpT_xgIzQ0B_mn/exec";

const form = document.getElementById("rsvp-form");
const guestFields = document.getElementById("guest-fields");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");
const submitText = document.getElementById("submit-text");

// Show the guest-count / dietary fields only once the person has
// indicated they're actually coming.
const attendingRadios = form.querySelectorAll('input[name="attending"]');
attendingRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    const isAttending = radio.value === "Joyfully accepts" && radio.checked;
    guestFields.dataset.hidden = isAttending ? "false" : "true";
  });
});
// Start hidden until a choice is made
guestFields.dataset.hidden = "true";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("", null);

  const formData = new FormData(form);
  const payload = {
    fullName: formData.get("fullName")?.trim() || "",
    email: formData.get("email")?.trim() || "",
    attending: formData.get("attending") || "",
    guestCount: formData.get("attending") === "Joyfully accepts" ? formData.get("guestCount") : "0",
    dietary: formData.get("dietary")?.trim() || "",
    message: formData.get("message")?.trim() || "",
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
    guestFields.dataset.hidden = "true";
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
