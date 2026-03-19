'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useIsMounted } from '@/hooks/useIsMounted';
import { ShieldCheck, UserPlus, Pencil, Trash2, Shield, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ExportButton } from '@/components/reports/ExportButton';

interface OrgUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const AVAILABLE_ROLES = [
  'SUPER_ADMIN', 'GOV_ADMIN', 'OPS_MANAGER', 
  'ANALYST', 'FIELD_SUPERVISOR', 'FIELD_OPERATOR', 
  'AUDITOR', 'VIEWER'
];

export default function UsersPage() {
  const isMounted = useIsMounted();
  const { token, user } = useAuthStore();
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error('Could not load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/invite`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to invite user');
      }
      
      toast.success('User invited successfully');
      setInviteEmail('');
      setInviteName('');
      setInviteRole('VIEWER');
      setIsInviteModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete user');
      }
      
      toast.success('User removed');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRoleChange = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: editRole })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update role');
      }
      
      toast.success('Role updated');
      setEditingUserId(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isMounted) return null;

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'GOV_ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <Shield className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-black mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          You do not have permission to view or manage users. Contact your Government Administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage organization access and security roles.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
        <ExportButton data={users} filename="civiq_users" />
      </div>

      <div className="liquid-glass-panel border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 border-b border-border text-[10px] uppercase font-black tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-card/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select 
                            value={editRole} 
                            onChange={(e) => setEditRole(e.target.value)}
                            className="bg-background border border-border rounded-lg px-2 py-1 text-xs"
                          >
                            {AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <button onClick={() => handleRoleChange(u.id)} className="text-emerald-500 text-xs font-bold hover:underline">Save</button>
                          <button onClick={() => setEditingUserId(null)} className="text-muted-foreground text-xs hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/50">
                          {u.role.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        <span className="text-[11px] font-medium text-muted-foreground">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== user?.id && (
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => { setEditingUserId(u.id); setEditRole(u.role); }}
                             className="p-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                             title="Edit Role"
                           >
                             <Pencil className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDelete(u.id)}
                             className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                             title="Remove User"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="font-black text-lg">Invite New User</h3>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input required type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input required type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="jane@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assigned Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                  {AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold tracking-wide transition-colors">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
