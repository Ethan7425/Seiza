// ---- Sign-in flow: name -> PIN (create or verify) ----

let welcomeContainer;
let onNameCheck = async () => null;
let onSignIn = async () => false;
let onCreateProfile = async () => {};

let phase = "name"; // "name" | "pin"
let mode = null; // "existing" | "new" — set once the name lookup resolves
let welcomeName = "";
let existingData = null;

function initWelcome(container, handlers) {
  welcomeContainer = container;
  onNameCheck = handlers.onNameCheck;
  onSignIn = handlers.onSignIn;
  onCreateProfile = handlers.onCreateProfile;

  phase = "name";
  mode = null;
  renderStep();
}

function renderStep() {
  if (phase === "name") renderNameStep();
  else renderPinStep();
  playStepEnter();
}

// Restarts the entrance animation on every step change — removing then
// re-adding the class (with a reflow in between) forces it to replay
// instead of only firing once on first paint.
function playStepEnter() {
  welcomeContainer.classList.remove("step-enter");
  void welcomeContainer.offsetWidth;
  welcomeContainer.classList.add("step-enter");
}

function renderNameStep() {
  welcomeContainer.innerHTML = `
    <div class="welcome-brand"><img src="../favicon.svg" class="welcome-brand-icon" alt=""></div>
    <h1>Welcome to Seiza</h1>
    <p>A star chart for the things you're learning. Enter your name to continue — new here, or picking up where you left off.</p>
    <label for="name-input">Your name</label>
    <input id="name-input" type="text" autocomplete="off" placeholder="Type your name" value="${welcomeName}">
    <button type="button" id="welcome-next" class="btn-primary">Continue</button>
  `;

  const input = welcomeContainer.querySelector("#name-input");
  const nextBtn = welcomeContainer.querySelector("#welcome-next");
  input.focus();

  const goNext = async () => {
    const value = input.value.trim();
    if (!value) {
      input.focus();
      return;
    }
    welcomeName = value;

    nextBtn.disabled = true;
    nextBtn.textContent = "Checking...";
    try {
      existingData = await onNameCheck(welcomeName);
    } catch (e) {
      alert(`Couldn't reach the database: ${e.message}`);
      nextBtn.disabled = false;
      nextBtn.textContent = "Continue";
      return;
    }

    mode = existingData ? "existing" : "new";
    phase = "pin";
    renderStep();
  };

  nextBtn.addEventListener("click", goNext);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  });
}

function renderPinStep() {
  const isNew = mode === "new";

  welcomeContainer.innerHTML = `
    <div class="welcome-brand"><img src="../favicon.svg" class="welcome-brand-icon" alt=""></div>
    <h1>${isNew ? `Nice to meet you, ${welcomeName}` : `Welcome back, ${welcomeName}`}</h1>
    <p>${isNew
      ? "Set a 4-digit PIN so you can find your way back here from any device."
      : "Enter your PIN to continue."}</p>
    <label for="pin-input">PIN</label>
    <input id="pin-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="&bull;&bull;&bull;&bull;" class="pin-input">
    <p class="welcome-error" hidden></p>
    <button type="button" id="welcome-pin-next" class="btn-primary">${isNew ? "Create profile" : "Sign in"}</button>
    <div class="step-nav">
      <button type="button" id="welcome-pin-back">&larr; Back</button>
    </div>
  `;

  const pinInput = welcomeContainer.querySelector("#pin-input");
  const pinBtn = welcomeContainer.querySelector("#welcome-pin-next");
  const errorEl = welcomeContainer.querySelector(".welcome-error");
  pinInput.focus();

  pinInput.addEventListener("input", () => {
    pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 4);
  });

  const submitPin = async () => {
    const pin = pinInput.value;
    if (pin.length !== 4) {
      errorEl.textContent = "PIN must be 4 digits.";
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;

    if (isNew) {
      pinBtn.disabled = true;
      pinBtn.textContent = "Creating...";
      await onCreateProfile(welcomeName, pin);
      return;
    }

    pinBtn.disabled = true;
    pinBtn.textContent = "Checking...";
    let ok = false;
    try {
      ok = await onSignIn(welcomeName, pin, existingData);
    } catch (e) {
      alert(`Couldn't reach the database: ${e.message}`);
      pinBtn.disabled = false;
      pinBtn.textContent = "Sign in";
      return;
    }
    if (!ok) {
      errorEl.textContent = "Incorrect PIN.";
      errorEl.hidden = false;
      pinBtn.disabled = false;
      pinBtn.textContent = "Sign in";
      pinInput.value = "";
      pinInput.classList.remove("shake");
      void pinInput.offsetWidth;
      pinInput.classList.add("shake");
      pinInput.focus();
    }
    // On success, onSignIn already redirected away.
  };

  pinBtn.addEventListener("click", submitPin);
  pinInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitPin();
    }
  });

  welcomeContainer.querySelector("#welcome-pin-back").addEventListener("click", () => {
    phase = "name";
    renderStep();
  });
}
