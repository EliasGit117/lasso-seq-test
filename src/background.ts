import { issuesListSchema, type TIssue } from '@/hooks/use-issues-storage';

const STORAGE_KEY = 'issues';

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'EMAIL_DETECTED' && message.email) {
    addEmailToStorage(message.email);
  }

  return true;
});

async function addEmailToStorage(email: string) {
  const result = await chrome.storage.sync.get([STORAGE_KEY]);
  const storedIssues = result[STORAGE_KEY] || [];

  const parseResult = issuesListSchema.safeParse(storedIssues);
  const existingEmails: TIssue[] = parseResult.success ? parseResult.data : [];

  const isAlreadyAdded = existingEmails.some((issue) => issue.email === email);
  if (isAlreadyAdded) {
    console.log(`Email ${email} is already in storage.`);
    return;
  }

  const updatedEmails: TIssue[] = [...existingEmails, { email }];
  await chrome.storage.sync.set({ [STORAGE_KEY]: updatedEmails });
  console.log(`Email ${email} added to storage.`);

  void chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon128.png', // Make sure you have an icon in your project
    title: 'Email Address Detected',
    message: `You entered an email in the prompt: ${email}. It has been logged.`,
  });
}