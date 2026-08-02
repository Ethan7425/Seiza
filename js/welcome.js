// ---- Welcome flow: name, then a few quick self-ratings ----

let welcomeContainer;
let onWelcomeComplete = () => {};
let onNameSubmit = () => true;
let welcomeName = "";
let welcomeAnswers = {};
let welcomeStep = 0; // 0 = name, 1..questions.length = one question each

const quizQuestions = buildQuizQuestions();

function initWelcome(container, handlers) {
  welcomeContainer = container;
  onWelcomeComplete = handlers.onComplete;
  onNameSubmit = handlers.onNameSubmit;
  welcomeStep = 0;
  welcomeAnswers = {};
  renderWelcomeStep();
}

function renderWelcomeStep() {
  if (welcomeStep === 0) {
    renderNameStep();
  } else {
    renderQuestionStep(quizQuestions[welcomeStep - 1]);
  }
}

function renderNameStep() {
  welcomeContainer.innerHTML = `
    <h1>Sign in</h1>
    <p>Enter your name to sign in, or a new one to create a profile.</p>
    <label for="name-input">Name</label>
    <input id="name-input" type="text" autocomplete="off" placeholder="Your name" value="${welcomeName}">
    <button type="button" id="welcome-next" class="btn-primary">Sign in</button>
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
    let isNewProfile = true;
    try {
      isNewProfile = await onNameSubmit(welcomeName);
    } finally {
      nextBtn.disabled = false;
      nextBtn.textContent = "Sign in";
    }

    // If it's not a new profile, onNameSubmit already signed us in and
    // redirected — nothing left to do on this page.
    if (isNewProfile) {
      welcomeStep = 1;
      renderWelcomeStep();
    }
  };

  nextBtn.addEventListener("click", goNext);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  });
}

function renderQuestionStep(q) {
  welcomeContainer.innerHTML = `
    <div class="quiz-progress">Question ${welcomeStep} of ${quizQuestions.length}</div>
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
      welcomeStep += 1;
      if (welcomeStep > quizQuestions.length) {
        finishWelcome();
      } else {
        renderWelcomeStep();
      }
    });
  });

  welcomeContainer.querySelector("#welcome-back").addEventListener("click", () => {
    welcomeStep -= 1;
    renderWelcomeStep();
  });

  welcomeContainer.querySelector("#welcome-skip").addEventListener("click", finishWelcome);
}

function finishWelcome() {
  onWelcomeComplete(welcomeName, welcomeAnswers);
}
