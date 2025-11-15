import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { BookingCard, Booking } from '../BookingCard';
import { EmptyState } from '../EmptyState';
import { CHBadge } from '../ui/ch-badge';

const mockBookings: Record<string, Booking[]> = {
  upcoming: [
    {
      id: '1',
      resourceTitle: 'Media Lab A',
      resourceLocation: 'Wells Library, 3rd Floor',
      date: 'Nov 12, 2025',
      time: '2:00 PM',
      duration: '2 hours',
      status: 'approved'
    },
    {
      id: '2',
      resourceTitle: 'Group Study Room 204',
      resourceLocation: 'Herman B Wells Library',
      date: 'Nov 13, 2025',
      time: '10:00 AM',
      duration: '3 hours',
      status: 'approved'
    },
  ],
  pending: [
    {
      id: '3',
      resourceTitle: 'Innovation Lab',
      resourceLocation: 'Luddy Hall, Room 1106',
      date: 'Nov 14, 2025',
      time: '3:00 PM',
      duration: '4 hours',
      status: 'pending'
    },
  ],
  past: [
    {
      id: '4',
      resourceTitle: 'Conference Room B',
      resourceLocation: 'Student Building, 2nd Floor',
      date: 'Nov 8, 2025',
      time: '1:00 PM',
      duration: '2 hours',
      status: 'completed'
    },
    {
      id: '5',
      resourceTitle: 'Recording Studio',
      resourceLocation: 'Radio & TV Building',
      date: 'Nov 5, 2025',
      time: '9:00 AM',
      duration: '3 hours',
      status: 'completed'
    },
  ],
  cancelled: [
    {
      id: '6',
      resourceTitle: 'Quiet Study Pod 12',
      resourceLocation: 'Wells Library, 5th Floor',
      date: 'Nov 9, 2025',
      time: '4:00 PM',
      duration: '2 hours',
      status: 'cancelled'
    },
  ]
};

export function Bookings() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past' | 'cancelled'>('upcoming');
  
  const tabs = [
    { id: 'upcoming' as const, label: 'Upcoming', count: mockBookings.upcoming.length },
    { id: 'pending' as const, label: 'Pending', count: mockBookings.pending.length },
    { id: 'past' as const, label: 'Past', count: mockBookings.past.length },
    { id: 'cancelled' as const, label: 'Cancelled/Rejected', count: mockBookings.cancelled.length },
  ];
  
  const currentBookings = mockBookings[activeTab];
  
  return (
    <div className="space-y-6">
      {/* Tabs - 2px crimson underline with count badges */}
      <div className="border-b border-border-default">
        <nav className="flex gap-6" aria-label="Booking tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                pb-3 border-b-2 transition-all duration-200
                flex items-center gap-2
                ${activeTab === tab.id
                  ? 'border-brand-crimson text-brand-crimson'
                  : 'border-transparent text-fg-muted hover:text-fg-default hover:border-border-muted'
                }
              `}
            >
              <span className="text-caption-medium">{tab.label}</span>
              {tab.count > 0 && (
                <CHBadge variant="neutral" size="sm">
                  {tab.count}
                </CHBadge>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Bookings List */}
      {currentBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onMessage={() => console.log('Message', booking.id)}
              onCancel={() => console.log('Cancel', booking.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={`No ${activeTab} bookings`}
          description={`You don't have any ${activeTab} bookings at the moment.`}
          actionLabel="Browse Resources"
        />
      )}
    </div>
  );
}