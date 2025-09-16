const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function scanTextAndSendMessage(text: string) {
  const matches = text.match(EMAIL_REGEX);
  if (!matches) return;

  const uniqueEmails = new Set(matches);
  uniqueEmails.forEach((email) => {
    console.log('Found email:', email);
    void chrome.runtime.sendMessage({ type: 'EMAIL_DETECTED', email });
  });
}

function attachListeners() {
  const editor = document.getElementById('prompt-textarea');
  // const sendButton = document.querySelector('[data-testid="send-button"]');

  if (
    !editor
    // || !sendButton
  ) {
    console.error('ChatGPT input elements not found.');
    return;
  }

  let prompt: string = '';

  const debounced = debounce((text: string) => {
    console.log('Debounced text:', text);
  }, 256);

  editor.addEventListener('input', () => {
    const text = editor.innerText.trim();
    debounced(text);
  });

  editor.addEventListener('keydown',
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
       scanTextAndSendMessage(prompt);
      }
    });

  // sendButton.addEventListener('click', () => {
  //   scanTextAndSendMessage(editor.innerText.trim());
  // });

  console.log('Email detection listeners attached to ChatGPT editor.');
}

const observer = new MutationObserver((_, obs) => {
  console.log('Trying to invoke observer.');
  const editor = document.getElementById('prompt-textarea');
  if (!editor)
    return;

  console.log('Editor has been found, trying to invoke observer.');
  attachListeners();
  obs.disconnect();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});


function debounce<F extends (...args: any[]) => void>(fn: F, wait: number) {
  let timeout: number | undefined;

  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}