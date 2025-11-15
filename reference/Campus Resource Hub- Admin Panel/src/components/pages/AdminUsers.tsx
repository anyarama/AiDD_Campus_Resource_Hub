import React, { useState } from 'react';
import { 
  MoreVertical, 
  Download, 
  UserCheck, 
  UserX, 
  Plus,
  Rows3,
  Rows4
} from 'lucide-react';
import { CHButton } from '../ui/ch-button';
import { CHBadge } from '../ui/ch-badge';
import { CHTable } from '../ui/ch-table';
import { CHDropdown } from '../ui/ch-dropdown';

/**
 * Admin Users Page
 * Enterprise table with bulk actions and density toggle
 */

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Student';
  status: 'active' | 'pending' | 'suspended';
  created: string;
}

type Density = 'comfortable' | 'compact';

export function AdminUsers() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [density, setDensity] = useState<Density>('comfortable');
  
  // Sample user data
  const users: User[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sjohnson@iu.edu',
      role: 'Admin',
      status: 'active',
      created: 'Jan 15, 2024',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'mchen@iu.edu',
      role: 'Staff',
      status: 'active',
      created: 'Feb 3, 2024',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'erodriguez@iu.edu',
      role: 'Student',
      status: 'active',
      created: 'Mar 12, 2024',
    },
    {
      id: 4,
      name: 'David Park',
      email: 'dpark@iu.edu',
      role: 'Student',
      status: 'pending',
      created: 'Mar 20, 2024',
    },
    {
      id: 5,
      name: 'Jessica Williams',
      email: 'jwilliams@iu.edu',
      role: 'Staff',
      status: 'active',
      created: 'Apr 5, 2024',
    },
    {
      id: 6,
      name: 'Robert Taylor',
      email: 'rtaylor@iu.edu',
      role: 'Student',
      status: 'suspended',
      created: 'May 10, 2024',
    },
    {
      id: 7,
      name: 'Amanda Brown',
      email: 'abrown@iu.edu',
      role: 'Admin',
      status: 'active',
      created: 'Jun 8, 2024',
    },
    {
      id: 8,
      name: 'Christopher Lee',
      email: 'clee@iu.edu',
      role: 'Student',
      status: 'active',
      created: 'Jul 22, 2024',
    },
  ];
  
  // Get role badge variant
  const getRoleBadgeVariant = (role: User['role']) => {
    if (role === 'Admin') return 'crimson';
    if (role === 'Staff') return 'info';
    return 'neutral';
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: User['status']) => {
    if (status === 'active') return 'success';
    if (status === 'pending') return 'warning';
    return 'danger';
  };
  
  // Toggle row selection
  const toggleRowSelection = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };
  
  // Toggle all rows
  const toggleAllRows = () => {
    if (selectedRows.length === users.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(users.map(u => u.id));
    }
  };
  
  // Bulk actions
  const handleActivate = () => {
    console.log('Activate users:', selectedRows);
  };
  
  const handleSuspend = () => {
    console.log('Suspend users:', selectedRows);
  };
  
  const handleExport = () => {
    console.log('Export users:', selectedRows);
  };
  
  // Row actions
  const handleRowAction = (action: string, userId: number) => {
    console.log(`${action} user:`, userId);
  };
  
  // Cell padding based on density
  const cellPadding = density === 'comfortable' ? 'p-4' : 'p-2';
  
  return (
    <div className="min-h-screen bg-canvas">
      {/* Admin Header - Normalized spacing */}
      <header className="bg-surface border-b border-default px-6 lg:px-8 py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-h1 text-fg-default mb-2">User Management</h1>
              <p className="text-body text-fg-muted">
                View and manage all users, roles, and permissions
              </p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Density Toggle */}
              <div className="flex items-center gap-1 bg-subtle border border-default rounded-md p-1">
                <button
                  onClick={() => setDensity('comfortable')}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded
                    text-caption transition-colors
                    ${density === 'comfortable' 
                      ? 'bg-surface text-fg-default shadow-sm' 
                      : 'text-fg-muted hover:text-fg-default'
                    }
                  `}
                  title="Comfortable density"
                >
                  <Rows3 className="w-4 h-4" />
                  Comfortable
                </button>
                <button
                  onClick={() => setDensity('compact')}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded
                    text-caption transition-colors
                    ${density === 'compact' 
                      ? 'bg-surface text-fg-default shadow-sm' 
                      : 'text-fg-muted hover:text-fg-default'
                    }
                  `}
                  title="Compact density"
                >
                  <Rows4 className="w-4 h-4" />
                  Compact
                </button>
              </div>
              
              <CHButton variant="primary">
                <Plus className="w-4 h-4" />
                Add User
              </CHButton>
            </div>
          </div>
        </div>
      </header>
      
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="
          flex items-center justify-between gap-4 
          px-4 py-3 
          bg-[#FFF5F5] border border-[#FFE0E0] rounded-lg
          animate-slide-up
        ">
          <p className="text-caption-semibold text-fg-default">
            {selectedRows.length} user{selectedRows.length > 1 ? 's' : ''} selected
          </p>
          
          <div className="flex items-center gap-2">
            <CHButton
              variant="secondary"
              size="sm"
              onClick={handleActivate}
            >
              <UserCheck className="w-4 h-4" />
              Activate
            </CHButton>
            
            <CHButton
              variant="secondary"
              size="sm"
              onClick={handleSuspend}
            >
              <UserX className="w-4 h-4" />
              Suspend
            </CHButton>
            
            <CHButton
              variant="secondary"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Export
            </CHButton>
          </div>
        </div>
      )}
      
      {/* Table */}
      <CHTable
        columns={[
          {
            key: 'name',
            header: 'Name',
            sortable: true,
            render: (user: User) => (
              <span className="text-caption-semibold text-fg-default">
                {user.name}
              </span>
            ),
          },
          {
            key: 'email',
            header: 'Email',
            sortable: true,
            render: (user: User) => (
              <span className="text-caption text-fg-muted">
                {user.email}
              </span>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            sortable: true,
            render: (user: User) => (
              <CHBadge variant={getRoleBadgeVariant(user.role)}>
                {user.role}
              </CHBadge>
            ),
            width: '120px',
          },
          {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (user: User) => (
              <CHBadge variant={getStatusBadgeVariant(user.status)}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </CHBadge>
            ),
            width: '120px',
          },
          {
            key: 'created',
            header: 'Created',
            sortable: true,
            render: (user: User) => (
              <span className="text-caption text-fg-muted">
                {user.created}
              </span>
            ),
            width: '120px',
          },
          {
            key: 'actions',
            header: '',
            render: (user: User) => (
              <CHDropdown
                trigger={
                  <button className="p-1 hover:bg-subtle rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-fg-muted" />
                  </button>
                }
                items={[
                  { label: 'Edit User', onClick: () => handleRowAction('edit', user.id) },
                  { label: 'View Details', onClick: () => handleRowAction('view', user.id) },
                  { label: 'Reset Password', onClick: () => handleRowAction('reset', user.id) },
                  { type: 'separator' },
                  { label: 'Suspend User', onClick: () => handleRowAction('suspend', user.id), danger: true },
                  { label: 'Delete User', onClick: () => handleRowAction('delete', user.id), danger: true },
                ]}
              />
            ),
            width: '64px',
          },
        ]}
        data={users}
        density={density}
        selectable
        selectedRows={new Set(selectedRows.map(String))}
        onSelectionChange={(newSelection) => {
          setSelectedRows(Array.from(newSelection).map(Number));
        }}
        getRowId={(user: User) => String(user.id)}
      />
    </div>
  );
}