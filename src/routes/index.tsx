import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { issueSchema, type TIssue, useIssuesStorage } from '@/hooks/use-issues-storage.ts';
import { Input } from '@/components/ui/input.tsx';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { issues, addIssue, removeIssue, clearIssues } = useIssuesStorage();
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    const parseResult = issueSchema.safeParse({ email });
    if (!parseResult.success) {
      // optional: show toast if invalid
      toast.error('Invalid email', { description: 'Please enter a valid email address.' });
      return;
    }
    addIssue(parseResult.data);
    setEmail('');
  };

  return (
    <main className="container mx-auto p-4 space-y-4 min-w-md min-h-md">
      <h1 className="text-xl font-bold">Issues List</h1>

      {/* Add new issue */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>

      {issues.length === 0 && <p className="text-muted-foreground">No issues found.</p>}

      <div className="space-y-4">
        {issues.map((issue: TIssue, index: number) => (
          <Card key={index} className="border border-border">
            <CardContent className="flex justify-between items-center">
              <span>{issue.email}</span>
              <Badge
                variant="destructive"
                className="cursor-pointer"
                onClick={() => removeIssue(issue.email)}
              >
                Remove
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {issues.length > 0 && (
        <Button variant="destructive" onClick={clearIssues}>
          Clear All
        </Button>
      )}
    </main>
  );
}