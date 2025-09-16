const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

let promptText = "";


function scanAndSend(text: string) {
  void chrome.runtime.sendMessage({ type: "CLEAR_CURRENT" });

  const matches = text.match(EMAIL_REGEX);
  if (!matches) return;

  const unique = Array.from(new Set(matches));

  void chrome.runtime.sendMessage({
    type: "EMAILS_DETECTED",
    emails: unique,
  });
}


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_ALERT" && Array.isArray(msg.emails)) {
    if (msg.emails.length > 0) {
      alert(`Detected emails:\n${msg.emails.join("\n")}`);
    }
  }
});


function attachListeners() {
  const editor = document.getElementById("prompt-textarea");
  if (!editor) return;

  editor.addEventListener("input", () => {
    promptText = editor.innerText.trim();
  });

  editor.addEventListener("paste", () => {
    promptText = (editor as HTMLElement).innerText.trim();
    console.log("paste ->", promptText);
  });

  editor.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      scanAndSend(promptText);
    }
  });

  console.log("[EmailDetector] Listeners attached.");
}

const obs = new MutationObserver((_, observer) => {
  const editor = document.getElementById("prompt-textarea");
  if (editor) {
    attachListeners();
    observer.disconnect();
  }
});

obs.observe(document.body, { childList: true, subtree: true });


function attachButtonListener() {
  const submitBtn = document.getElementById("composer-submit-button");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", () => {
    console.log("[EmailDetector] Submit button clicked");
    scanAndSend(promptText);
  });

  console.log("[EmailDetector] Button listener attached.");
}

const buttonObs = new MutationObserver(() => {
  const submitBtn = document.getElementById("composer-submit-button");
  if (submitBtn) {
    attachButtonListener();
    buttonObs.disconnect(); // optional if you only need it once
  }
});

buttonObs.observe(document.body, { childList: true, subtree: true });