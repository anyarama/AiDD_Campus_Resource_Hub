import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  TrendingUp,
  ChevronRight,
  Download,
  ArrowRight,
  Star,
  MessageSquare,
  User,
  Settings,
  MapPin,
  Clock
} from 'lucide-react';
import { CHCard, CHCardHeader, CHCardTitle, CHCardContent } from '../ui/ch-card';
import { CHBadge } from '../ui/ch-badge';
import { CHButton } from '../ui/ch-button';
import { CHLineChart, CHDoughnutChart } from '../ui/ch-chart';
import { CHSkeleton, CHSkeletonCard, CHSkeletonText } from '../ui/ch-skeleton';
import { CHEmpty } from '../ui/ch-empty';
import { CHStatCard } from '../ui/ch-stat-card';
import { motion } from 'motion/react';

/**
 * Dashboard Page
 * Enterprise-grade dashboard with consistent spacing, sophisticated interactions,
 * and polished visual design following IU brand guidelines
 */

export function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  
  // KPI Data
  const kpis = [
    {
      icon: <Calendar className="w-5 h-5" strokeWidth={2} />,
      label: 'Total Bookings',
      value: '1,284',
      delta: {
        value: '+8%',
        direction: 'up' as const,
        caption: 'vs last month',
      },
      trend: [145, 178, 192, 168, 215, 243, 284],
    },
    {
      icon: <Users className="w-5 h-5" strokeWidth={2} />,
      label: 'Active Users',
      value: '892',
      delta: {
        value: '+12%',
        direction: 'up' as const,
        caption: 'vs last month',
      },
      trend: [620, 680, 720, 760, 810, 850, 892],
    },
    {
      icon: <BookOpen className="w-5 h-5" strokeWidth={2} />,
      label: 'Resources',
      value: '156',
      delta: {
        value: '+3',
        direction: 'up' as const,
        caption: 'new this month',
      },
      trend: [150, 151, 153, 153, 154, 155, 156],
    },
    {
      icon: <TrendingUp className="w-5 h-5" strokeWidth={2} />,
      label: 'Utilization',
      value: '87%',
      delta: {
        value: '+5%',
        direction: 'up' as const,
        caption: 'vs last month',
      },
      trend: [78, 80, 82, 84, 85, 86, 87],
    },
  ];
  
  // Chart Data - Bookings Over Time
  const bookingsData = [
    { month: 'Jan', bookings: 145 },
    { month: 'Feb', bookings: 178 },
    { month: 'Mar', bookings: 192 },
    { month: 'Apr', bookings: 168 },
    { month: 'May', bookings: 215 },
    { month: 'Jun', bookings: 243 },
  ];
  
  // Chart Data - Category Breakdown
  const categoryData = [
    { name: 'Study Rooms', value: 385 },
    { name: 'Labs', value: 312 },
    { name: 'Libraries', value: 287 },
    { name: 'Conference Rooms', value: 186 },
    { name: 'Equipment', value: 114 },
  ];
  
  // Upcoming Bookings
  const upcomingBookings = [
    {
      id: 1,
      resource: 'Wells Library - Study Room 3A',
      location: 'Wells Library, Floor 3',
      date: 'Today, Nov 11',
      time: '2:00 PM - 4:00 PM',
      duration: '2 hours',
      status: 'Confirmed',
      statusVariant: 'success' as const,
    },
    {
      id: 2,
      resource: 'Luddy Hall - Lab 2150',
      location: 'Luddy Hall, Floor 2',
      date: 'Tomorrow, Nov 12',
      time: '10:00 AM - 12:00 PM',
      duration: '2 hours',
      status: 'Confirmed',
      statusVariant: 'success' as const,
    },
    {
      id: 3,
      resource: 'Student Union - Conference Room B',
      location: 'Student Union, Floor 2',
      date: 'Nov 14, 2025',
      time: '1:00 PM - 3:00 PM',
      duration: '2 hours',
      status: 'Pending',
      statusVariant: 'warning' as const,
    },
  ];
  
  // Recent Activity
  const recentActivity = [
    {
      id: 1,
      icon: <Calendar className="w-4 h-4" />,
      iconBg: 'bg-brand-crimson/10',
      iconColor: 'text-brand-crimson',
      verb: 'booked',
      subject: 'Wells Library - Study Room 3A',
      time: '2 minutes ago',
    },
    {
      id: 2,
      icon: <Star className="w-4 h-4" />,
      iconBg: 'bg-warning-light',
      iconColor: 'text-warning',
      verb: 'reviewed',
      subject: 'Luddy Hall - Lab 2150',
      time: '15 minutes ago',
    },
    {
      id: 3,
      icon: <MessageSquare className="w-4 h-4" />,
      iconBg: 'bg-info-light',
      iconColor: 'text-info',
      verb: 'commented on',
      subject: 'Conference Room B',
      time: '1 hour ago',
    },
    {
      id: 4,
      icon: <User className="w-4 h-4" />,
      iconBg: 'bg-subtle',
      iconColor: 'text-fg-muted',
      verb: 'updated profile',
      subject: 'Personal information',
      time: '2 hours ago',
    },
    {
      id: 5,
      icon: <Calendar className="w-4 h-4" />,
      iconBg: 'bg-danger-light',
      iconColor: 'text-danger',
      verb: 'cancelled',
      subject: 'Study Room 4B',
      time: '3 hours ago',
    },
    {
      id: 6,
      icon: <Settings className="w-4 h-4" />,
      iconBg: 'bg-subtle',
      iconColor: 'text-fg-muted',
      verb: 'changed',
      subject: 'Notification settings',
      time: '5 hours ago',
    },
  ];
  
  return (
    <div className="flex flex-col gap-8">
      {/* Header Row - Normalized spacing */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-h1 mb-2">Dashboard</h1>
          <p className="text-body text-fg-muted">
            Welcome back! Here's what's happening with your campus resources.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          <CHButton variant="secondary" size="md" className="hidden lg:flex">
            View Calendar
          </CHButton>
          <CHButton variant="primary" size="md">
            <Calendar className="w-4 h-4" />
            New Booking
          </CHButton>
        </div>
      </header>
      
      {/* KPI Row - Standardized Cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <CHSkeletonCard />
              <CHSkeletonCard />
              <CHSkeletonCard />
              <CHSkeletonCard />
            </>
          ) : (
            kpis.map((kpi, index) => (
              <CHStatCard
                key={index}
                label={kpi.label}
                value={kpi.value}
                delta={kpi.delta}
                trend={kpi.trend}
                icon={kpi.icon}
              />
            ))
          )}
        </div>
      </section>
      
      {/* Charts Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-h3 text-fg-default">Analytics Overview</h2>
          <p className="text-caption text-fg-muted mt-1">Booking trends and resource distribution</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bookings Over Time - Line Chart */}
          <CHCard elevation="sm" className="group hover:shadow-md transition-shadow duration-200">
            <CHCardHeader className="border-b border-border-muted">
              <div className="flex items-center justify-between">
                <CHCardTitle>Bookings Over Time</CHCardTitle>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 text-fg-muted hover:text-brand-crimson hover:bg-brand-crimson/5 rounded-md transition-colors"
                    aria-label="Download chart data"
                  >
                    <Download className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button 
                    className="text-caption text-brand-crimson hover:text-brand-crimson-dark flex items-center gap-1 transition-colors"
                    aria-label="View detailed analytics"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CHCardHeader>
            <CHCardContent>
              {loading ? (
                <CHSkeleton variant="rectangular" height="300px" />
              ) : (
                <div className="pt-2">
                  <CHLineChart
                    data={bookingsData}
                    dataKey="bookings"
                    xAxisKey="month"
                    height={300}
                    showArea={true}
                  />
                </div>
              )}
            </CHCardContent>
          </CHCard>
          
          {/* Category Breakdown - Doughnut Chart */}
          <CHCard elevation="sm" className="group hover:shadow-md transition-shadow duration-200">
            <CHCardHeader className="border-b border-border-muted">
              <div className="flex items-center justify-between">
                <CHCardTitle>Category Breakdown</CHCardTitle>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 text-fg-muted hover:text-brand-crimson hover:bg-brand-crimson/5 rounded-md transition-colors"
                    aria-label="Download chart data"
                  >
                    <Download className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button 
                    className="text-caption text-brand-crimson hover:text-brand-crimson-dark flex items-center gap-1 transition-colors"
                    aria-label="View category details"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CHCardHeader>
            <CHCardContent>
              {loading ? (
                <CHSkeleton variant="rectangular" height="300px" />
              ) : (
                <div className="pt-2">
                  <CHDoughnutChart data={categoryData} height={300} />
                </div>
              )}
            </CHCardContent>
          </CHCard>
        </div>
      </section>
      
      {/* Lists Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-h3 text-fg-default">Your Activity</h2>
          <p className="text-caption text-fg-muted mt-1">Upcoming bookings and recent actions</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Upcoming Bookings */}
          <CHCard elevation="sm" className="group hover:shadow-md transition-shadow duration-200">
            <CHCardHeader className="border-b border-border-muted">
              <div className="flex items-center justify-between">
                <CHCardTitle>Upcoming Bookings</CHCardTitle>
                <CHButton variant="ghost" size="sm" className="text-brand-crimson hover:text-brand-crimson-dark">
                  View All
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </CHButton>
              </div>
            </CHCardHeader>
            <CHCardContent>
              {loading ? (
                <CHSkeletonText lines={6} />
              ) : showEmpty ? (
                <CHEmpty
                  icon={<Calendar className="w-8 h-8 text-fg-muted" />}
                  title="No upcoming bookings"
                  description="You don't have any bookings scheduled. Book a resource to get started."
                  action={
                    <CHButton variant="primary" size="sm">
                      <Calendar className="w-4 h-4" />
                      Book Now
                    </CHButton>
                  }
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group/item p-4 bg-subtle rounded-lg 
                        hover:bg-subtle/80 dark:hover:bg-subtle
                        transition-all duration-200 cursor-pointer border border-transparent hover:border-brand-crimson/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-caption-semibold text-fg-default mb-2.5 truncate">
                            {booking.resource}
                          </h4>
                          
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-caption text-fg-muted">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{booking.location}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-caption text-fg-muted">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>{booking.date}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-caption text-fg-muted">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>{booking.time}</span>
                            </div>
                          </div>
                        </div>
                        
                        <CHBadge variant={booking.statusVariant} size="sm" className="shrink-0">
                          {booking.status}
                        </CHBadge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CHCardContent>
          </CHCard>
          
          {/* Recent Activity */}
          <CHCard elevation="sm" className="group hover:shadow-md transition-shadow duration-200">
            <CHCardHeader className="border-b border-border-muted">
              <div className="flex items-center justify-between">
                <CHCardTitle>Recent Activity</CHCardTitle>
                <CHButton variant="ghost" size="sm" className="text-brand-crimson hover:text-brand-crimson-dark">
                  View All
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </CHButton>
              </div>
            </CHCardHeader>
            <CHCardContent>
              {loading ? (
                <CHSkeletonText lines={8} />
              ) : showEmpty ? (
                <CHEmpty
                  icon={<TrendingUp className="w-8 h-8 text-fg-muted" />}
                  title="No recent activity"
                  description="Your activity will appear here as you interact with the platform."
                />
              ) : (
                <div className="flex flex-col divide-y divide-border-muted">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 
                        hover:bg-subtle/50 -mx-1 px-1 rounded transition-colors duration-150"
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 
                        ${activity.iconBg} ${activity.iconColor}`}
                      >
                        {activity.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-caption text-fg-default">
                          <span className="font-medium">You</span>
                          {' '}
                          <span className="text-fg-muted">{activity.verb}</span>
                          {' '}
                          <span className="font-medium truncate inline-block max-w-full align-bottom">
                            {activity.subject}
                          </span>
                        </p>
                        <p className="text-micro text-fg-subtle mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CHCardContent>
          </CHCard>
        </div>
      </section>
      
      {/* Quick Stats Summary - Enhanced with Sparklines & Progress */}
      <section>
        <div className="mb-4">
          <h2 className="text-h3 text-fg-default">Quick Stats Summary</h2>
          <p className="text-caption text-fg-muted mt-1">Real-time insights into today's activity</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CHStatCard
            label="Today's Bookings"
            value="24"
            icon={<Calendar className="w-4 h-4" />}
            trend={{
              value: '+6',
              direction: 'up',
              period: 'vs yesterday',
            }}
            chart={{
              type: 'sparkline',
              data: [18, 20, 17, 22, 19, 21, 24],
            }}
            tooltip="Total bookings made today compared to yesterday's count"
            size="md"
          />
          
          <CHStatCard
            label="Peak Time"
            value="2-4 PM"
            icon={<Clock className="w-4 h-4" />}
            badge={{
              text: 'Most popular',
              variant: 'info',
            }}
            chart={{
              type: 'sparkline',
              data: [12, 18, 24, 28, 32, 29, 22],
            }}
            tooltip="Time slot with the highest booking demand today"
            size="md"
          />
          
          <CHStatCard
            label="Available Now"
            value="42"
            icon={<BookOpen className="w-4 h-4" />}
            badge={{
              text: '27% of total',
              variant: 'neutral',
            }}
            chart={{
              type: 'progress',
              percentage: 27,
            }}
            tooltip="Resources currently available for booking out of 156 total"
            size="md"
          />
          
          <CHStatCard
            label="Avg. Duration"
            value="1.8h"
            icon={<TrendingUp className="w-4 h-4" />}
            trend={{
              value: '+0.2h',
              direction: 'up',
              period: 'vs last week',
            }}
            badge={{
              text: 'Per booking',
              variant: 'neutral',
            }}
            tooltip="Average booking duration across all resources today"
            size="md"
          />
        </div>
      </section>
    </div>
  );
}