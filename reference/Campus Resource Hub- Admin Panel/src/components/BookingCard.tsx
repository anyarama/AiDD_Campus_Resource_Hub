import React from 'react';
import { Calendar, Clock, MapPin, MessageSquare, X } from 'lucide-react';
import { IUCard } from './IUCard';
import { IUBadge, BadgeVariant } from './IUBadge';
import { IUButton } from './IUButton';

export interface Booking {
  id: string;
  resourceTitle: string;
  resourceLocation: string;
  date: string;
  time: string;
  duration: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';
  requestedBy?: string;
}

interface BookingCardProps {
  booking: Booking;
  onMessage?: () => void;
  onCancel?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export function BookingCard({
  booking,
  onMessage,
  onCancel,
  onApprove,
  onReject,
  showActions = true
}: BookingCardProps) {
  const statusVariants: Record<string, BadgeVariant> = {
    pending: 'warning',
    approved: 'success',
    completed: 'neutral',
    cancelled: 'neutral',
    rejected: 'neutral'
  };
  
  const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected'
  };
  
  // Status border colors - 4px left border
  const statusBorderColors = {
    pending: 'border-l-[#8A5A00]',      // amber
    approved: 'border-l-[#1B5E20]',     // green
    completed: 'border-l-[#6B6B6B]',    // neutral gray
    cancelled: 'border-l-[#6B6B6B]',    // neutral gray
    rejected: 'border-l-[#B71C1C]'      // red
  };
  
  return (
    <IUCard className={`border-l-4 ${statusBorderColors[booking.status]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h5 className="text-iu-primary mb-1">{booking.resourceTitle}</h5>
          {booking.requestedBy && (
            <p className="text-sm text-iu-secondary">Requested by {booking.requestedBy}</p>
          )}
        </div>
        <IUBadge variant={statusVariants[booking.status]}>
          {statusLabels[booking.status]}
        </IUBadge>
      </div>
      
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-iu-secondary">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{booking.resourceLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-iu-secondary">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{booking.date}</span>
        </div>
        <div className="flex items-center gap-2 text-iu-secondary">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{booking.time} ({booking.duration})</span>
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center gap-2 pt-4 border-t border-iu">
          {onApprove && onReject ? (
            <>
              <IUButton size="sm" onClick={onApprove} className="flex-1">
                Approve
              </IUButton>
              <IUButton variant="secondary" size="sm" onClick={onReject} className="flex-1 hover:bg-danger hover:text-white hover:border-danger">
                Reject
              </IUButton>
            </>
          ) : (
            <>
              {onMessage && (
                <IUButton variant="secondary" size="sm" onClick={onMessage}>
                  <MessageSquare className="w-4 h-4" />
                  Message
                </IUButton>
              )}
              {onCancel && booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                <IUButton variant="secondary" size="sm" onClick={onCancel} className="hover:bg-danger hover:text-white hover:border-danger">
                  <X className="w-4 h-4" />
                  Cancel
                </IUButton>
              )}
            </>
          )}
        </div>
      )}
    </IUCard>
  );
}