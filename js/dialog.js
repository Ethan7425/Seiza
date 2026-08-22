// ---- Custom confirm/alert dialogs ----
// Replaces the browser's native confirm()/alert() — those render as a
// flat, unstyled OS popup with zero control over appearance, which
// breaks the whole dark, custom-built look everywhere else in the app.
// Promise-based so call sites just `await` them instead of getting a
// synchronous return value; every existing confirm()/alert() call site
// already lived inside an async function, so the conversion was just
// adding "await" in front.

let dialogBackdrop, dialogBox, dialogMessage, dialogActions;

function initDialogs() {
  dialogBackdrop = document.getElementById("dialog-backdrop");
  dialogBox = document.getElementById("dialog-box");
  dialogMessage = document.getElementById("dialog-message");
  dialogActions = document.getElementById("dialog-actions");
}

function showDialog(message, buttons) {
  return new Promise(resolve => {
    dialogMessage.textContent = message;
    dialogActions.innerHTML = "";

    buttons.forEach(({ label, value, danger }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.className = danger ? "btn-danger" : "btn-link";
      btn.addEventListener("click", () => {
        closeDialog();
        resolve(value);
      });
      dialogActions.appendChild(btn);
    });

    dialogBackdrop.classList.add("visible");
    dialogBox.classList.add("open");
    dialogActions.lastElementChild.focus();
  });
}

function closeDialog() {
  dialogBackdrop.classList.remove("visible");
  dialogBox.classList.remove("open");
}

// A one-button acknowledgement — the drop-in replacement for alert().
function showAppAlert(message) {
  return showDialog(message, [{ label: "OK", value: true }]);
}

// Resolves true/false — the drop-in replacement for confirm(). Pass
// confirmLabel for destructive actions ("Remove", "Delete") instead of
// the default "Continue", and danger:true to color that button as a
// warning.
function showAppConfirm(message, { confirmLabel = "Continue", danger = false } = {}) {
  return showDialog(message, [
    { label: "Cancel", value: false },
    { label: confirmLabel, value: true, danger }
  ]);
}
