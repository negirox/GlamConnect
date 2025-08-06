
'use client';

import { useEffect, useState } from 'react';
import { 
    readPasswordResetRequests, 
    updatePasswordResetStatus,
    PasswordResetRequest 
} from '@/lib/password-reset-actions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function PasswordResetsPage() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    const allRequests = await readPasswordResetRequests();
    const sortedRequests = allRequests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    setRequests(sortedRequests);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (request: PasswordResetRequest, newStatus: 'completed' | 'rejected') => {
    const id = `${request.email}-${request.requestedAt}`;
    setUpdatingId(id);
    try {
        await updatePasswordResetStatus(request.email, request.requestedAt, newStatus);
        toast({ title: "Success", description: `Request for ${request.email} has been marked as ${newStatus}.`});
        await fetchRequests(); // Re-fetch to update the view
    } catch(e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive"});
    } finally {
        setUpdatingId(null);
    }
  }

  const statusColors: Record<PasswordResetRequest['status'], string> = {
    pending: 'bg-yellow-500',
    completed: 'bg-green-500',
    rejected: 'bg-red-500',
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-headline font-bold">Password Reset Requests</h1>
            <p className="text-muted-foreground">Review and process user requests for password resets.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>A log of all password reset submissions from users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Contact Via</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(req => {
                const uniqueId = `${req.email}-${req.requestedAt}`;
                return (
                    <TableRow key={uniqueId}>
                    <TableCell className="font-medium">{req.email}</TableCell>
                    <TableCell>{req.phone || 'N/A'}</TableCell>
                    <TableCell><Badge variant="outline">{req.contactMethod}</Badge></TableCell>
                    <TableCell>{formatDistanceToNow(new Date(req.requestedAt), { addSuffix: true })}</TableCell>
                    <TableCell>
                        <Badge className={`${statusColors[req.status]} capitalize`}>{req.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {req.status === 'pending' ? (
                            <div className="flex gap-2 justify-end">
                                <Button size="icon" variant="ghost" className='text-red-500 hover:bg-red-100' onClick={() => handleStatusUpdate(req, 'rejected')} disabled={updatingId === uniqueId}>
                                    {updatingId === uniqueId ? <Loader2 className='animate-spin'/> : <X className='h-4 w-4'/>}
                                </Button>
                                <Button size="icon" variant="ghost" className='text-green-500 hover:bg-green-100' onClick={() => handleStatusUpdate(req, 'completed')} disabled={updatingId === uniqueId}>
                                    {updatingId === uniqueId ? <Loader2 className='animate-spin'/> : <Check className='h-4 w-4'/>}
                                </Button>
                            </div>
                        ) : 'Processed'}
                    </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
           {requests.length === 0 && (
                <div className="text-center text-muted-foreground py-20">
                    <p className="text-lg font-medium">No Password Reset Requests</p>
                    <p>The queue is currently empty.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
