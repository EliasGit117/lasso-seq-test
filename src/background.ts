import { issuesListSchema, type TIssue } from "@/hooks/use-issues-storage";

const ISSUES_KEY = "issues";                // глобальная история
const CURRENT_KEY = "currentIssues";        // currentIssues_{tabId}
const DISMISSED_KEY = "dismissedEmails";    // глобальный список dismissed

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;

  if (msg.type === "EMAILS_DETECTED" && Array.isArray(msg.emails) && tabId) {
    void handleDetected(msg.emails, tabId);
  }

  if (msg.type === "CLEAR_CURRENT" && tabId) {
    void chrome.storage.local.set({ [`${CURRENT_KEY}_${tabId}`]: [] });
  }

  if (msg.type === "REMOVE_EMAIL" && msg.email) {
    void removeEmailEverywhere(msg.email);
  }

  if (msg.type === "DISMISS_EMAIL" && msg.email) {
    void dismissEmail(msg.email);
  }

  return true;
});

async function handleDetected(emails: string[], tabId: number) {
  const result = await chrome.storage.local.get([ISSUES_KEY, `${CURRENT_KEY}_${tabId}`, DISMISSED_KEY]);
  const history = issuesListSchema.safeParse(result[ISSUES_KEY] || []).data || [];
  const dismissed = result[DISMISSED_KEY] || [];

  const activeEmails = emails.filter(e => {
    const entry = dismissed.find((d: any) => d.email === e);
    return !entry || new Date(entry.until) < new Date();
  });

  const newIssues = activeEmails.map(e => ({ email: e }));
  const updatedHistory = [...history, ...newIssues.filter(ni => !history.some(hi => hi.email === ni.email))];

  await chrome.storage.local.set({
    [ISSUES_KEY]: updatedHistory,
    [`${CURRENT_KEY}_${tabId}`]: newIssues
  });

  if (activeEmails.length > 0) {
    chrome.tabs.sendMessage(tabId, { type: "SHOW_ALERT", emails: activeEmails });
  }
}

async function removeEmailEverywhere(email: string) {
  const all = await chrome.storage.local.get(null);
  const history = all[ISSUES_KEY] || [];
  const updatedHistory = history.filter((i: TIssue) => i.email !== email);

  const updates: Record<string, any> = { [ISSUES_KEY]: updatedHistory };

  Object.keys(all)
    .filter(k => k.startsWith(CURRENT_KEY))
    .forEach(k => {
      const arr = all[k] || [];
      updates[k] = arr.filter((i: TIssue) => i.email !== email);
    });

  await chrome.storage.local.set(updates);
}

async function dismissEmail(email: string) {
  const until = new Date(Date.now() + 24*60*60*1000); // 24h
  const res = await chrome.storage.local.get([DISMISSED_KEY]);
  const dismissed = res[DISMISSED_KEY] || [];
  const updated = [...dismissed.filter((d: any) => d.email !== email), { email, until: until.toISOString() }];
  await chrome.storage.local.set({ [DISMISSED_KEY]: updated });
}