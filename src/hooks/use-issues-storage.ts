import { useEffect, useState } from "react";
import z from "zod";

export const issueSchema = z.object({ email: z.string().email() });
export const issuesListSchema = z.array(issueSchema);
export type TIssue = z.infer<typeof issueSchema>;

const ISSUES_KEY = "issues";
const CURRENT_KEY = "currentIssues";
const DISMISSED_KEY = "dismissedEmails";

export function useIssuesStorage() {
  const [issues, setIssues] = useState<TIssue[]>([]);
  const [currentIssues, setCurrentIssues] = useState<TIssue[]>([]);
  const [dismissed, setDismissed] = useState<{ email: string; until: string }[]>([]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      const currentKey = `${CURRENT_KEY}_${tabId}`;

      chrome.storage.local.get([ISSUES_KEY, currentKey, DISMISSED_KEY], (res) => {
        setIssues(issuesListSchema.safeParse(res[ISSUES_KEY] || []).data || []);
        setCurrentIssues(issuesListSchema.safeParse(res[currentKey] || []).data || []);
        setDismissed(res[DISMISSED_KEY] || []);
      });

      function handle(changes: { [key: string]: chrome.storage.StorageChange }) {
        if (changes[ISSUES_KEY]) {
          setIssues(issuesListSchema.safeParse(changes[ISSUES_KEY].newValue || []).data || []);
        }
        if (changes[currentKey]) {
          setCurrentIssues(issuesListSchema.safeParse(changes[currentKey].newValue || []).data || []);
        }
        if (changes[DISMISSED_KEY]) {
          setDismissed(changes[DISMISSED_KEY].newValue || []);
        }
      }

      chrome.storage.onChanged.addListener(handle);
      return () => chrome.storage.onChanged.removeListener(handle);
    });
  }, []);

  // Методы для UI
  const removeIssue = (email: string) => chrome.runtime.sendMessage({ type: "REMOVE_EMAIL", email });
  const dismissIssue = (email: string) => chrome.runtime.sendMessage({ type: "DISMISS_EMAIL", email });

  return { issues, currentIssues, dismissed, removeIssue, dismissIssue };
}