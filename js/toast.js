// ---- Toast notifications ----

let toastContainer;

function initToasts(container) {
  toastContainer = container;
}

function showToast(message, variant = "default") {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${variant}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Add "visible" a frame later so the transition actually plays.
  requestAnimationFrame(() => toast.classList.add("visible"));

  setTimeout(() => {
    toast.classList.remove("visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3200);
}
