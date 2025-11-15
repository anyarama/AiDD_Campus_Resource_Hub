import React, { useState } from 'react';
import { 
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  X,
  AlertCircle,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { CHButton } from '../ui/ch-button';
import { CHBadge } from '../ui/ch-badge';
import { CHTabs, CHTabsContent } from '../ui/ch-tabs';
import { CHCard, CHCardContent } from '../ui/ch-card';
import { CHEmpty } from '../ui/ch-empty';

/**
 * My Bookings Page
 * Clean tabbed interface with booking cards and actions
 * Tabs: Upcoming, Pending, Past, Cancelled/Rejected
 */

interface Booking {
  id: number;
  resourceName: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'pending' | 'past' | 'cancelled' | 'rejected';
  policyNote?: string;
}

export function MyBookings() {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Sample booking data
  const bookings: Booking[] = [
    {
      id: 1,
      resourceName: 'Wells Library - Study Room 3A',
      location: 'Wells Library, Floor 3',
      date: 'Today, Nov 11, 2025',
      time: '2:00 PM - 4:00 PM',
      duration: '2 hours',
      status: 'upcoming',
      policyNote: 'Cancel up to 2 hours before start time',
    },
    {
      id: 2,
      resourceName: 'Luddy Hall - Computer Science Lab 2150',
      location: 'Luddy Hall, Floor 2',
      date: 'Tomorrow, Nov 12, 2025',
      time: '10:00 AM - 12:00 PM',
      duration: '2 hours',
      status: 'upcoming',
      policyNote: 'Cancel up to 2 hours before start time',
    },
    {
      id: 3,
      resourceName: 'Student Union - Conference Room B',
      location: 'Student Union, Floor 2',
      date: 'Nov 14, 2025',
      time: '1:00 PM - 3:00 PM',
      duration: '2 hours',
      status: 'upcoming',
      policyNote: 'Cancel up to 2 hours before start time',
    },
    {
      id: 4,
      resourceName: 'Main Library - Group Study Pod 5',
      location: 'Main Library, Floor 1',
      date: 'Nov 15, 2025',
      time: '3:00 PM - 5:00 PM',
      duration: '2 hours',
      status: 'pending',
      policyNote: 'Awaiting approval from resource manager',
    },
    {
      id: 5,
      resourceName: 'Chemistry Lab - Research Station 12',
      location: 'Chemistry Building, Floor 3',
      date: 'Nov 16, 2025',
      time: '9:00 AM - 11:00 AM',
      duration: '2 hours',
      status: 'pending',
      policyNote: 'Awaiting approval from resource manager',
    },
    {
      id: 6,
      resourceName: 'Kelley School - MBA Study Lounge',
      location: 'Kelley School of Business, Floor 1',
      date: 'Nov 5, 2025',
      time: '2:00 PM - 4:00 PM',
      duration: '2 hours',
      status: 'past',
    },
    {
      id: 7,
      resourceName: 'Fine Arts Library - Reading Room',
      location: 'Fine Arts Building, Floor 2',
      date: 'Nov 3, 2025',
      time: '10:00 AM - 12:00 PM',
      duration: '2 hours',
      status: 'past',
    },
    {
      id: 8,
      resourceName: 'IMU Conference Center - Room A',
      location: 'Indiana Memorial Union, Floor 3',
      date: 'Oct 28, 2025',
      time: '1:00 PM - 3:00 PM',
      duration: '2 hours',
      status: 'cancelled',
      policyNote: 'Cancelled by you on Oct 27, 2025',
    },
    {
      id: 9,
      resourceName: 'Physics Lab - Equipment Room',
      location: 'Physics Building, Floor 2',
      date: 'Oct 20, 2025',
      time: '9:00 AM - 11:00 AM',
      duration: '2 hours',
      status: 'rejected',
      policyNote: 'Request rejected - Room reserved for class',
    },
  ];
  
  // Get bookings by status
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'past');
  const cancelledRejectedBookings = bookings.filter(b => 
    b.status === 'cancelled' || b.status === 'rejected'
  );
  
  // Handle actions
  const handleMessage = (bookingId: number) => {
    console.log('Message resource manager for booking:', bookingId);
  };
  
  const handleCancel = (bookingId: number) => {
    console.log('Cancel booking:', bookingId);
  };
  
  const handleRebook = (bookingId: number) => {
    console.log('Rebook:', bookingId);
  };
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-1">My Bookings</h1>
          <p className="text-caption text-fg-muted">
            View and manage all your resource bookings
          </p>
        </div>
      </div>
      
      {/* Sticky Tabs */}
      <div className="sticky top-0 z-10 bg-canvas pt-2 pb-4 -mx-6 px-6">
        <CHTabs
          tabs={[
            { value: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
            { value: 'pending', label: 'Pending', count: pendingBookings.length },
            { value: 'past', label: 'Past', count: pastBookings.length },
            { value: 'cancelled', label: 'Cancelled/Rejected', count: cancelledRejectedBookings.length },
          ]}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          {/* Upcoming Tab */}
          <CHTabsContent value="upcoming" activeValue={activeTab}>
            {upcomingBookings.length === 0 ? (
              <CHEmpty
                icon={<Calendar className="w-8 h-8 text-fg-muted" />}
                title="No upcoming bookings"
                description="You don't have any upcoming bookings scheduled. Browse resources to make a new booking."
                action={
                  <CHButton variant="primary">
                    <BookOpen className="w-4 h-4" />
                    Browse Resources
                  </CHButton>
                }
              />
            ) : (
              <div className="flex flex-col gap-4">
                {upcomingBookings.map((booking) => (
                  <CHCard key={booking.id} elevation="sm">
                    <CHCardContent>
                      <div className="flex flex-col gap-4">
                        {/* Main Content Row */}
                        <div className="flex items-start justify-between gap-6">
                          {/* Left: Booking Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-caption-semibold text-fg-default mb-3">
                              {booking.resourceName}
                            </h3>
                            
                            <div className="flex flex-col gap-2">
                              {/* Location */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.location}</span>
                              </div>
                              
                              {/* Date */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.date}</span>
                              </div>
                              
                              {/* Time + Duration */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.time} ({booking.duration})</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right: Actions */}
                          <div className="flex items-start gap-2 flex-shrink-0">
                            <CHButton
                              variant="secondary"
                              size="sm"
                              onClick={() => handleMessage(booking.id)}
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message
                            </CHButton>
                            
                            <CHButton
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancel(booking.id)}
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </CHButton>
                          </div>
                        </div>
                        
                        {/* Footer with Policy/Help Hint */}
                        {booking.policyNote && (
                          <div className="flex items-start gap-2 pt-3 border-t border-muted">
                            <AlertCircle className="w-4 h-4 text-fg-muted flex-shrink-0 mt-0.5" />
                            <p className="text-caption text-fg-muted">
                              {booking.policyNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </CHCardContent>
                  </CHCard>
                ))}
              </div>
            )}
          </CHTabsContent>
          
          {/* Pending Tab */}
          <CHTabsContent value="pending" activeValue={activeTab}>
            {pendingBookings.length === 0 ? (
              <CHEmpty
                icon={<Clock className="w-8 h-8 text-fg-muted" />}
                title="No pending bookings"
                description="You don't have any bookings awaiting approval."
                action={
                  <CHButton variant="primary">
                    <BookOpen className="w-4 h-4" />
                    Browse Resources
                  </CHButton>
                }
              />
            ) : (
              <div className="flex flex-col gap-4">
                {pendingBookings.map((booking) => (
                  <CHCard key={booking.id} elevation="sm">
                    <CHCardContent>
                      <div className="flex flex-col gap-4">
                        {/* Main Content Row */}
                        <div className="flex items-start justify-between gap-6">
                          {/* Left: Booking Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="text-caption-semibold text-fg-default">
                                {booking.resourceName}
                              </h3>
                              <CHBadge variant="warning">Pending Approval</CHBadge>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {/* Location */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.location}</span>
                              </div>
                              
                              {/* Date */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.date}</span>
                              </div>
                              
                              {/* Time + Duration */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.time} ({booking.duration})</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right: Actions */}
                          <div className="flex items-start gap-2 flex-shrink-0">
                            <CHButton
                              variant="secondary"
                              size="sm"
                              onClick={() => handleMessage(booking.id)}
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message
                            </CHButton>
                            
                            <CHButton
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancel(booking.id)}
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </CHButton>
                          </div>
                        </div>
                        
                        {/* Footer with Policy/Help Hint */}
                        {booking.policyNote && (
                          <div className="flex items-start gap-2 pt-3 border-t border-muted">
                            <AlertCircle className="w-4 h-4 text-fg-muted flex-shrink-0 mt-0.5" />
                            <p className="text-caption text-fg-muted">
                              {booking.policyNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </CHCardContent>
                  </CHCard>
                ))}
              </div>
            )}
          </CHTabsContent>
          
          {/* Past Tab */}
          <CHTabsContent value="past" activeValue={activeTab}>
            {pastBookings.length === 0 ? (
              <CHEmpty
                icon={<CheckCircle className="w-8 h-8 text-fg-muted" />}
                title="No past bookings"
                description="You haven't completed any bookings yet."
                action={
                  <CHButton variant="primary">
                    <BookOpen className="w-4 h-4" />
                    Browse Resources
                  </CHButton>
                }
              />
            ) : (
              <div className="flex flex-col gap-4">
                {pastBookings.map((booking) => (
                  <CHCard key={booking.id} elevation="sm">
                    <CHCardContent>
                      <div className="flex flex-col gap-4">
                        {/* Main Content Row */}
                        <div className="flex items-start justify-between gap-6">
                          {/* Left: Booking Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="text-caption-semibold text-fg-default">
                                {booking.resourceName}
                              </h3>
                              <CHBadge variant="neutral">Completed</CHBadge>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {/* Location */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.location}</span>
                              </div>
                              
                              {/* Date */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.date}</span>
                              </div>
                              
                              {/* Time + Duration */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.time} ({booking.duration})</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right: Actions */}
                          <div className="flex items-start gap-2 flex-shrink-0">
                            <CHButton
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRebook(booking.id)}
                            >
                              <Calendar className="w-4 h-4" />
                              Book Again
                            </CHButton>
                          </div>
                        </div>
                      </div>
                    </CHCardContent>
                  </CHCard>
                ))}
              </div>
            )}
          </CHTabsContent>
          
          {/* Cancelled/Rejected Tab */}
          <CHTabsContent value="cancelled" activeValue={activeTab}>
            {cancelledRejectedBookings.length === 0 ? (
              <CHEmpty
                icon={<XCircle className="w-8 h-8 text-fg-muted" />}
                title="No cancelled or rejected bookings"
                description="You don't have any cancelled or rejected bookings."
                action={
                  <CHButton variant="primary">
                    <BookOpen className="w-4 h-4" />
                    Browse Resources
                  </CHButton>
                }
              />
            ) : (
              <div className="flex flex-col gap-4">
                {cancelledRejectedBookings.map((booking) => (
                  <CHCard key={booking.id} elevation="sm">
                    <CHCardContent>
                      <div className="flex flex-col gap-4">
                        {/* Main Content Row */}
                        <div className="flex items-start justify-between gap-6">
                          {/* Left: Booking Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="text-caption-semibold text-fg-default">
                                {booking.resourceName}
                              </h3>
                              <CHBadge variant="danger">
                                {booking.status === 'cancelled' ? 'Cancelled' : 'Rejected'}
                              </CHBadge>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {/* Location */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.location}</span>
                              </div>
                              
                              {/* Date */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.date}</span>
                              </div>
                              
                              {/* Time + Duration */}
                              <div className="flex items-center gap-2 text-caption text-fg-muted">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.time} ({booking.duration})</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right: Actions */}
                          <div className="flex items-start gap-2 flex-shrink-0">
                            <CHButton
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRebook(booking.id)}
                            >
                              <Calendar className="w-4 h-4" />
                              Book Again
                            </CHButton>
                          </div>
                        </div>
                        
                        {/* Footer with Policy/Help Hint */}
                        {booking.policyNote && (
                          <div className="flex items-start gap-2 pt-3 border-t border-muted">
                            <AlertCircle className="w-4 h-4 text-fg-muted flex-shrink-0 mt-0.5" />
                            <p className="text-caption text-fg-muted">
                              {booking.policyNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </CHCardContent>
                  </CHCard>
                ))}
              </div>
            )}
          </CHTabsContent>
        </CHTabs>
      </div>
    </div>
  );
}