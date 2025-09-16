import { useCallback, useEffect, useState } from 'react';
import z from 'zod';

export const issueSchema = z.object({
  email: z.string().email()
});
export const issuesListSchema = z.array(issueSchema);

export type TIssue = z.infer<typeof issueSchema>;

const key = 'issues';

export function useIssuesStorage() {
  const [issues, setIssues] = useState<TIssue[]>([]);


  useEffect(() => {
    chrome.storage.sync.get([key], (res) => {
      const storedIssues = res[key] || [];
      const parseResult = issuesListSchema.safeParse(storedIssues);
      setIssues(parseResult.success ? parseResult.data : []);
    });
  }, []);

  const addIssue = useCallback((issue: TIssue) => {
    setIssues((prev) => {
      const updated = [...prev, issue];
      void chrome.storage.sync.set({ [key]: updated });
      return updated;
    });
  }, []);

  const removeIssue = useCallback((email: string) => {
    setIssues((prev) => {
      const updated = prev.filter((i) => i.email !== email);
      void chrome.storage.sync.set({ [key]: updated });
      return updated;
    });
  }, []);

  const clearIssues = useCallback(() => {
    setIssues([]);
    void chrome.storage.sync.remove(key);
  }, []);

  return { issues, addIssue, removeIssue, clearIssues };
}
