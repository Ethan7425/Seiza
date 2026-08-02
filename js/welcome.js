// ---- Sign-in flow: name -> PIN (create or verify) -> quiz for new profiles ----

let welcomeContainer;
let onNameCheck = async () => null;
let onSignIn = async () => false;
let onCreateProfile = async () => {};

let phase = "name"; // "name" | "pin" | "quiz"
let mode = null; // "existing" | "new" — set once the name lookup resolves
let welcomeName = "";
let existingData = null;
let pendingPin = ""; // the PIN a new profile just created, carried into the quiz phase
let welcomeAnswers = {};
let quizIndex = 0;

const quizQuestions = buildQuizQuestions();

function initWelcome(container, handlers) {
  welcomeContainer = container;
  onNameCheck = handlers.onNameCheck;
  onSignIn = handlers.onSignIn;
  onCreateProfile = handlers.onCreateProfile;

  phase = "name";
  mode = null;
  welcomeAnswers = {};
  quizIndex = 0;
  renderStep();
}

function renderStep() {
  if (phase === "name") renderNameStep();
  else if (phase === "pin") renderPinStep();
  else renderQuestionStep(quizQuestions[quizIndex]);
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
    <h1>Sign in</h1>
    <p>Enter your name to sign in, or a new one to create a profile.</p>
    <label for="name-input">Name</label>
    <input id="name-input" type="text" autocomplete="off" placeholder="Your name" value="${welcomeName}">
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
    <h1>${isNew ? "Create a PIN" : "Enter your PIN"}</h1>
    <p>${isNew
      ? `Pick a 4-digit PIN for "${welcomeName}" — just enough to keep this profile yours.`
      : `Enter the 4-digit PIN for "${welcomeName}".`}</p>
    <label for="pin-input">PIN</label>
    <input id="pin-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="&bull;&bull;&bull;&bull;" class="pin-input">
    <p class="welcome-error" hidden></p>
    <button type="button" id="welcome-pin-next" class="btn-primary">${isNew ? "Continue" : "Sign in"}</button>
    <div class="quiz-nav">
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
      pendingPin = pin;
      phase = "quiz";
      quizIndex = 0;
      renderStep();
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

function renderQuestionStep(q) {
  welcomeContainer.innerHTML = `
    <div class="quiz-progress">Question ${quizIndex + 1} of ${quizQuestions.length}</div>
    <h2 class="quiz-question">${q.question}</h2>
    <div class="quiz-options">
      ${EXPERIENCE_LEVELS.map(level => `
        <button type="button" class="quiz-option" data-level="${level.id}">${level.label}</button>
      `).join("")}
    </div>
    <div class="quiz-nav">
      <button type="button" id="welcome-back">&larr; Back</button>
      <button type="button" id="welcome-skip">Skip quiz</button>
    </div>
  `;

  welcomeContainer.querySelectorAll(".quiz-option").forEach(btn => {
    btn.addEventListener("click", () => {
      welcomeAnswers[q.branch] = btn.dataset.level;
      quizIndex += 1;
      if (quizIndex >= quizQuestions.length) {
        finishWelcome();
      } else {
        renderStep();
      }
    });
  });

  welcomeContainer.querySelector("#welcome-back").addEventListener("click", () => {
    if (quizIndex === 0) {
      phase = "pin";
    } else {
      quizIndex -= 1;
    }
    renderStep();
  });

  welcomeContainer.querySelector("#welcome-skip").addEventListener("click", finishWelcome);
}

function finishWelcome() {
  onCreateProfile(welcomeName, pendingPin, welcomeAnswers);
}
