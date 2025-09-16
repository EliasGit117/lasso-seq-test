import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIssuesStorage, type TIssue } from '@/hooks/use-issues-storage';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HistoryIcon, MailWarningIcon, VolumeXIcon, XIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { useState } from 'react';

export const Route = createFileRoute('/')({ component: RouteComponent });

enum Tab {
  Current = 'current',
  History = 'history',
}

function RouteComponent() {
  const { issues, currentIssues } = useIssuesStorage();
  const [tab, setTab] = useState<Tab>(Tab.Current);
  const data = (tab === Tab.Current ? currentIssues : issues).reverse();

  return (
    <main className="p-4 space-y-4 w-[512px]">
      <h1 className="text-lg font-semibold">Email Issues</h1>

      <Tabs value={tab} onValueChange={v => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value={Tab.Current}>
            <MailWarningIcon/>
            <span>Current Issues</span>
          </TabsTrigger>
          <TabsTrigger value={Tab.History}>
            <HistoryIcon/>
            <span>History</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {data.length === 0 ? (
        <p>{tab === Tab.Current ? 'No issues found.' : 'No history.'}</p>
      ) : (
        <IssuesTable issues={data}/>
      )}


      {/*<Tabs defaultValue={Tab.Current} className="space-y-4">*/}
      {/*  <TabsList>*/}
      {/*    {tabs.map((t) => (<TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>))}*/}
      {/*  </TabsList>*/}

      {/*  {tabs.map((t) => (*/}
      {/*    <TabsContent key={t.value} value={t.value}>*/}
      {/*      {t.data.length === 0 ? (*/}
      {/*        <p>{t.value === Tab.Current ? 'No issues found.' : 'No history.'}</p>*/}
      {/*      ) : (*/}
      {/*        <IssuesTable issues={t.data}/>*/}
      {/*      )}*/}
      {/*    </TabsContent>*/}
      {/*  ))}*/}
      {/*</Tabs>;*/}
    </main>
  )
    ;
}

const IssuesTable = ({ issues }: { issues: TIssue[] }) => {
  const { removeIssue, dismissIssue, dismissed } = useIssuesStorage();

  const isDismissed = (email: string) =>
    dismissed.some(d => d.email === email && new Date(d.until) > new Date());

  return (
    <ScrollArea className="rounded-md border pr-4">
      <div className='max-h-64'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((i, idx) => {
              const d = isDismissed(i.email);
              return (
                <TableRow key={idx}>
                  <TableCell>{i.email}</TableCell>
                  <TableCell>
                    <Badge variant={d ? 'secondary' : 'default'}>{d ? 'Dismissed' : 'Active'}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    {!d && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-fit w-fit"
                        onClick={() => dismissIssue(i.email)}
                      >
                        <VolumeXIcon/><span>Dismiss 24h</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs px-2 py-1 h-fit w-fit"
                      onClick={() => removeIssue(i.email)}
                    >
                      <XIcon/><span>Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
};
