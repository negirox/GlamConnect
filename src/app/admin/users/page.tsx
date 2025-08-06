
'use client'

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAllUsers, createUser, updateUser } from '@/lib/user-actions';
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
import { Loader2, PlusCircle, Search, Edit, Power, PowerOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'model' | 'brand' | 'admin';
  status: 'active' | 'inactive';
};

const userFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').optional(),
  role: z.enum(['model', 'brand', 'admin']),
  status: z.enum(['active', 'inactive']),
});

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const newUserForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema.refine(data => data.password, {
        message: 'Password is required for new users',
        path: ['password']
    })),
    defaultValues: { role: 'admin', status: 'active' },
  });

  const editUserForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
  });

  const fetchUsers = async () => {
    setLoading(true);
    const allUsers = await getAllUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const onNewUserSubmit = async (values: z.infer<typeof userFormSchema>) => {
      setIsSubmitting(true);
      try {
          await createUser(values as any); // Password is confirmed to exist by resolver
          toast({ title: 'Success', description: 'New admin created.' });
          newUserForm.reset();
          setIsNewUserDialogOpen(false);
          await fetchUsers();
      } catch (error: any) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } finally {
          setIsSubmitting(false);
      }
  }

  const onEditUserSubmit = async (values: z.infer<typeof userFormSchema>) => {
    if(!editingUser) return;
    setIsSubmitting(true);
    try {
        await updateUser(editingUser.id, values);
        toast({ title: 'Success', description: 'User updated successfully.' });
        editUserForm.reset();
        setIsEditDialogOpen(false);
        setEditingUser(null);
        await fetchUsers();
    } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
        await updateUser(user.id, { status: newStatus });
        toast({ title: 'Success', description: `User has been ${newStatus}.` });
        await fetchUsers();
    } catch(error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    editUserForm.reset(user);
    setIsEditDialogOpen(true);
  }

  const roleColors: Record<User['role'], 'default' | 'secondary' | 'destructive'> = {
    admin: 'destructive',
    brand: 'secondary',
    model: 'default',
  };

  const statusColors: Record<User['status'], 'success' | 'warning'> = {
    active: 'success',
    inactive: 'warning',
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-headline font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all platform users and their roles.</p>
        </div>
        <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2"/> New Admin</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Admin</DialogTitle>
                    <DialogDescription>This will create a new user with administrative privileges.</DialogDescription>
                </DialogHeader>
                 <Form {...newUserForm}>
                    <form onSubmit={newUserForm.handleSubmit(onNewUserSubmit)} className="space-y-4 py-4">
                        <FormField control={newUserForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={newUserForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={newUserForm.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 animate-spin"/>}
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>A list of all registered users on the platform.</CardDescription>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." className="pl-8 sm:w-[300px]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleColors[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>{user.status}</Badge>
                  </TableCell>
                   <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4"/>
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(user)}>
                            {user.status === 'active' ? <PowerOff className="h-4 w-4 text-red-500"/> : <Power className="h-4 w-4 text-green-500"/>}
                        </Button>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
                    <DialogDescription>Change user role and status.</DialogDescription>
                </DialogHeader>
                 <Form {...editUserForm}>
                    <form onSubmit={editUserForm.handleSubmit(onEditUserSubmit)} className="space-y-4 py-4">
                        <FormField control={editUserForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={editUserForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={editUserForm.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="model">Model</SelectItem>
                                        <SelectItem value="brand">Brand</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={editUserForm.control} name="status" render={({ field }) => (
                            <FormItem><FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 animate-spin"/>}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
