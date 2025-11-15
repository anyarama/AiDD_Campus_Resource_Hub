import React, { useState } from 'react';
import { Calendar, Users, Package, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { AdminLayout, KPIRow } from '../AdminLayout';
import { KPICard } from '../KPICard';
import { ChartCard, ChartContainer, ChartFooter, ChartLegend } from '../ChartCard';
import { ListCard, PendingApprovalItem, ActivityItem, EmptyState } from '../ListCard';
import { IUButton } from '../IUButton';
import {
  LineChart,
  Line,
  DoughnutChart,
  Doughnut,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data
const bookingsOverTime = [
  { date: 'Mon', bookings: 45, capacity: 60 },
  { date: 'Tue', bookings: 52, capacity: 60 },
  { date: 'Wed', bookings: 48, capacity: 60 },
  { date: 'Thu', bookings: 61, capacity: 60 },
  { date: 'Fri', bookings: 55, capacity: 60 },
  { date: 'Sat', bookings: 38, capacity: 60 },
  { date: 'Sun', bookings: 42, capacity: 60 },
];

const categoryBreakdown = [
  { name: 'Study Rooms', value: 35, color: 'var(--iu-crimson)' },
  { name: 'Equipment', value: 25, color: 'var(--iu-crimson-300)' },
  { name: 'Labs', value: 20, color: 'var(--iu-accent)' },
  { name: 'Event Spaces', value: 15, color: 'var(--iu-crimson-100)' },
  { name: 'Other', value: 5, color: 'var(--iu-neutral-300)' },
];

const pendingApprovals = [
  {
    id: '1',
    type: 'booking' as const,
    title: 'Media Lab A Booking',
    subtitle: 'Sarah Johnson · Nov 15, 2025 · 2:00 PM - 4:00 PM',
    timestamp: '5 minutes ago',
    status: 'urgent' as const
  },
  {
    id: '2',
    type: 'resource' as const,
    title: 'New Equipment Request',
    subtitle: 'Michael Chen · 4K Camera Kit',
    timestamp: '1 hour ago',
    status: 'pending' as const
  },
  {
    id: '3',
    type: 'user' as const,
    title: 'Staff Access Request',
    subtitle: 'Emily Rodriguez · Physics Department',
    timestamp: '2 hours ago',
    status: 'pending' as const
  },
];

const recentActivity = [
  {
    id: '1',
    type: 'approved' as const,
    user: 'Admin User',
    action: 'approved booking for',
    target: 'Conference Room B',
    timestamp: '10 minutes ago'
  },
  {
    id: '2',
    type: 'created' as const,
    user: 'David Kim',
    action: 'created new resource',
    target: '3D Printer Station',
    timestamp: '45 minutes ago'
  },
  {
    id: '3',
    type: 'updated' as const,
    user: 'Jessica Williams',
    action: 'updated availability for',
    target: 'Study Room 204',
    timestamp: '2 hours ago'
  },
  {
    id: '4',
    type: 'rejected' as const,
    user: 'Admin User',
    action: 'rejected access request for',
    target: 'Lab Equipment',
    timestamp: '3 hours ago'
  },
];

export function AdminDashboard() {
  const [bookingsTimeRange, setBookingsTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');
  
  const handleApprove = (id: string) => {
    console.log('Approve:', id);
    // Handle approval logic
  };
  
  const handleReject = (id: string) => {
    console.log('Reject:', id);
    // Handle rejection logic
  };
  
  return (
    <AdminLayout
      title="Dashboard"
      breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
    >
      <div className="flex flex-col gap-6">
        {/* KPI Cards - 4 tiles in responsive grid */}
        <KPIRow>
          <KPICard
            icon={Calendar}
            label="Total Bookings"
            value="1,247"
            deltaDirection="up"
            deltaValue="+18%"
            period="vs last month"
          />
          <KPICard
            icon={Users}
            label="Active Users"
            value="892"
            deltaDirection="up"
            deltaValue="+12%"
            period="vs last month"
          />
          <KPICard
            icon={Package}
            label="Resources"
            value="156"
            deltaDirection="up"
            deltaValue="+5%"
            period="vs last month"
          />
          <KPICard
            icon={TrendingUp}
            label="Utilization"
            value="78%"
            deltaDirection="down"
            deltaValue="-3%"
            period="vs last month"
          />
        </KPIRow>
        
        {/* Chart Cards - 2 charts side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings Over Time - Line Chart */}
          <ChartCard
            title="Bookings Over Time"
            timeRange={bookingsTimeRange}
            onTimeRangeChange={(range) => setBookingsTimeRange(range)}
            footer={
              <ChartFooter
                stats={[
                  { label: 'Max', value: '61', color: 'var(--iu-accent)' },
                  { label: 'Min', value: '38', color: 'var(--iu-accent)' },
                  { label: 'Avg', value: '49', color: 'var(--iu-accent)' },
                ]}
                lastUpdated="5 minutes ago"
              />
            }
          >
            <ChartContainer height="280px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--iu-border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--iu-text-secondary)"
                    style={{ fontSize: '14px', fontWeight: 400 }}
                  />
                  <YAxis 
                    stroke="var(--iu-text-secondary)"
                    style={{ fontSize: '14px', fontWeight: 400 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--iu-surface)',
                      border: '1px solid var(--iu-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '14px'
                    }}
                    labelStyle={{ color: 'var(--iu-text-primary)', fontWeight: 500 }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="var(--iu-accent)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--iu-accent)', r: 4 }}
                    name="Bookings"
                  />
                  <Line
                    type="monotone"
                    dataKey="capacity"
                    stroke="var(--iu-neutral-300)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'var(--iu-neutral-300)', r: 3 }}
                    name="Capacity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
          
          {/* Category Breakdown - Doughnut Chart */}
          <ChartCard
            title="Category Breakdown"
            showTimeRangeSelector={false}
            footer={
              <ChartFooter
                stats={[
                  { label: 'Total Categories', value: '5' },
                  { label: 'Most Popular', value: 'Study Rooms' },
                ]}
                lastUpdated="5 minutes ago"
              />
            }
          >
            <ChartContainer height="280px">
              <div className="flex flex-col h-full">
                <ChartLegend
                  items={categoryBreakdown.map(cat => ({
                    label: cat.name,
                    color: cat.color,
                    value: `${cat.value}%`
                  }))}
                />
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--iu-surface)',
                          border: '1px solid var(--iu-border)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-md)',
                          fontSize: '14px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ChartContainer>
          </ChartCard>
        </div>
        
        {/* List Cards - Pending Approvals & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <ListCard
            title="Pending Approvals"
            action={
              <span className="admin-small text-role-accent">
                {pendingApprovals.length} pending
              </span>
            }
          >
            {pendingApprovals.length > 0 ? (
              <>
                {pendingApprovals.map(approval => (
                  <PendingApprovalItem
                    key={approval.id}
                    {...approval}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
                <div className="p-4 border-t border-role-border">
                  <IUButton variant="ghost" className="w-full">
                    View All Approvals
                  </IUButton>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<CheckCircle2 className="w-8 h-8" />}
                title="No Pending Approvals"
                description="All requests have been processed"
              />
            )}
          </ListCard>
          
          {/* Recent Activity */}
          <ListCard
            title="Recent Activity"
            action={
              <IUButton variant="ghost" size="sm">
                View All
              </IUButton>
            }
          >
            {recentActivity.map(activity => (
              <ActivityItem key={activity.id} {...activity} />
            ))}
            <div className="p-4 border-t border-role-border">
              <IUButton variant="ghost" className="w-full">
                View Full Activity Log
              </IUButton>
            </div>
          </ListCard>
        </div>
      </div>
    </AdminLayout>
  );
}
