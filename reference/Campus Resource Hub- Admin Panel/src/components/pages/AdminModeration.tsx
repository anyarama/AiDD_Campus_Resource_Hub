import React, { useState } from 'react';
import { 
  CheckCircle, 
  MoreVertical,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { CHButton } from '../ui/ch-button';
import { CHBadge } from '../ui/ch-badge';
import { CHCard, CHCardContent, CHCardHeader, CHCardTitle } from '../ui/ch-card';
import { CHDropdown } from '../ui/ch-dropdown';
import { CHEmpty } from '../ui/ch-empty';

/**
 * Admin Moderation Page
 * Enterprise-grade content moderation queue with consistent design
 * Matches AdminUsers and AdminAnalytics patterns
 */

interface ModerationItem {
  id: number;
  title: string;
  type: 'Review' | 'Booking' | 'Resource';
  reason: string;
  reasonSeverity: 'low' | 'medium' | 'high' | 'critical';
  reporter: string;
  date: string;
}

export function AdminModeration() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // Sample moderation data
  const items: ModerationItem[] = [
    {
      id: 1,
      title: 'Inappropriate review comment for Wells Library Study Room',
      type: 'Review',
      reason: 'Inappropriate Language',
      reasonSeverity: 'high',
      reporter: 'Sarah Johnson',
      date: 'Nov 10, 2025',
    },
    {
      id: 2,
      title: 'Suspected fake booking for Luddy Hall Lab 2150',
      type: 'Booking',
      reason: 'Suspicious Activity',
      reasonSeverity: 'medium',
      reporter: 'System Auto-detect',
      date: 'Nov 10, 2025',
    },
    {
      id: 3,
      title: 'Spam resource listing - "Free Pizza in Room 101"',
      type: 'Resource',
      reason: 'Spam Content',
      reasonSeverity: 'critical',
      reporter: 'Michael Chen',
      date: 'Nov 9, 2025',
    },
    {
      id: 4,
      title: 'Offensive profile picture on user account',
      type: 'Review',
      reason: 'Inappropriate Content',
      reasonSeverity: 'high',
      reporter: 'Emily Rodriguez',
      date: 'Nov 9, 2025',
    },
    {
      id: 5,
      title: 'Repeated no-show bookings from same user',
      type: 'Booking',
      reason: 'Policy Violation',
      reasonSeverity: 'medium',
      reporter: 'System Auto-detect',
      date: 'Nov 8, 2025',
    },
    {
      id: 6,
      title: 'Misleading resource description for Conference Room B',
      type: 'Resource',
      reason: 'Misinformation',
      reasonSeverity: 'low',
      reporter: 'David Park',
      date: 'Nov 8, 2025',
    },
  ];
  
  // Get reason badge variant based on severity
  const getReasonBadgeVariant = (severity: ModerationItem['reasonSeverity']) => {
    if (severity === 'critical') return 'danger';
    if (severity === 'high') return 'danger';
    if (severity === 'medium') return 'warning';
    return 'neutral';
  };
  
  // Get type badge variant
  const getTypeBadgeVariant = (type: ModerationItem['type']) => {
    if (type === 'Review') return 'info';
    if (type === 'Booking') return 'warning';
    return 'neutral';
  };
  
  // Toggle item selection
  const toggleItemSelection = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  // Toggle all items
  const toggleAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(i => i.id));
    }
  };
  
  // Bulk resolve
  const handleBulkResolve = () => {
    console.log('Bulk resolve items:', selectedItems);
  };
  
  // Item actions
  const handleItemAction = (action: string, itemId: number) => {
    console.log(`${action} item:`, itemId);
  };
  
  return (
    <div className="min-h-screen bg-canvas">
      {/* Admin Header - Normalized spacing */}
      <header className="bg-surface border-b border-default px-6 lg:px-8 py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-h1 text-fg-default mb-2">Moderation Queue</h1>
              <p className="text-body text-fg-muted">
                Review and moderate flagged content
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <CHButton variant="secondary" size="md">
                <Filter className="w-4 h-4" />
                Filter
              </CHButton>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="px-6 lg:px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          
          {/* Bulk Action Bar */}
          {selectedItems.length > 0 && (
            <div className="bg-success-light border border-success/20 rounded-lg px-5 py-4 flex items-center justify-between gap-4 animate-slide-up">
              <p className="text-caption-semibold text-fg-default">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </p>
              
              <CHButton
                variant="primary"
                size="md"
                onClick={handleBulkResolve}
              >
                <CheckCircle className="w-4 h-4" />
                Resolve Selected
              </CHButton>
            </div>
          )}
          
          {/* Moderation Table Card */}
          <CHCard elevation="sm">
            <CHCardHeader className="border-b border-border-muted">
              <CHCardTitle>Flagged Items ({items.length})</CHCardTitle>
            </CHCardHeader>
            
            <CHCardContent className="p-0">
              {items.length === 0 ? (
                <div className="p-12">
                  <CHEmpty
                    icon={<CheckCircle className="w-8 h-8 text-fg-muted" />}
                    title="No items to moderate"
                    description="All flagged content has been reviewed. Great work!"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-subtle border-b border-border-muted">
                        <th className="w-12 px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selectedItems.length === items.length && items.length > 0}
                            onChange={toggleAllItems}
                            className="w-4 h-4 rounded border-default text-brand-crimson 
                              focus:ring-2 focus:ring-brand-crimson cursor-pointer
                              transition-colors"
                            aria-label="Select all items"
                          />
                        </th>
                        <th className="px-4 py-3.5 text-left text-caption-semibold text-fg-default">
                          Item
                        </th>
                        <th className="px-4 py-3.5 text-left text-caption-semibold text-fg-default w-32">
                          Type
                        </th>
                        <th className="px-4 py-3.5 text-left text-caption-semibold text-fg-default w-48">
                          Reason
                        </th>
                        <th className="px-4 py-3.5 text-left text-caption-semibold text-fg-default w-40">
                          Reporter
                        </th>
                        <th className="px-4 py-3.5 text-left text-caption-semibold text-fg-default w-32">
                          Date
                        </th>
                        <th className="px-4 py-3.5 text-center text-caption-semibold text-fg-default w-20">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-border-muted">
                      {items.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`
                            transition-colors duration-150 cursor-pointer
                            ${selectedItems.includes(item.id) ? 'bg-[#F9F7F6]' : 'hover:bg-[#F9F7F6]'}
                          `}
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          {/* Checkbox */}
                          <td className="px-5 py-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              className="w-4 h-4 rounded border-default text-brand-crimson 
                                focus:ring-2 focus:ring-brand-crimson cursor-pointer
                                transition-colors"
                              aria-label={`Select ${item.title}`}
                            />
                          </td>
                          
                          {/* Title */}
                          <td className="px-4 py-4">
                            <p className="text-caption text-fg-default line-clamp-2">
                              {item.title}
                            </p>
                          </td>
                          
                          {/* Type Badge */}
                          <td className="px-4 py-4">
                            <CHBadge variant={getTypeBadgeVariant(item.type)} size="sm">
                              {item.type}
                            </CHBadge>
                          </td>
                          
                          {/* Reason Badge */}
                          <td className="px-4 py-4">
                            <CHBadge variant={getReasonBadgeVariant(item.reasonSeverity)} size="sm">
                              {item.reason}
                            </CHBadge>
                          </td>
                          
                          {/* Reporter */}
                          <td className="px-4 py-4">
                            <p className="text-caption text-fg-muted truncate">
                              {item.reporter}
                            </p>
                          </td>
                          
                          {/* Date */}
                          <td className="px-4 py-4">
                            <p className="text-caption text-fg-muted whitespace-nowrap">
                              {item.date}
                            </p>
                          </td>
                          
                          {/* Actions Dropdown */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center">
                              <CHDropdown
                                trigger={
                                  <button 
                                    className="p-2 hover:bg-subtle rounded-md transition-colors
                                      focus-visible:outline-none focus-visible:ring-2 
                                      focus-visible:ring-brand-crimson focus-visible:ring-offset-2"
                                    aria-label="Item actions"
                                  >
                                    <MoreVertical className="w-4 h-4 text-fg-muted" />
                                  </button>
                                }
                                items={[
                                  { 
                                    label: 'View Details', 
                                    onClick: () => handleItemAction('view', item.id) 
                                  },
                                  { 
                                    label: 'Resolve', 
                                    onClick: () => handleItemAction('resolve', item.id) 
                                  },
                                  { 
                                    label: 'Escalate', 
                                    onClick: () => handleItemAction('escalate', item.id) 
                                  },
                                  { type: 'separator' },
                                  { 
                                    label: 'Dismiss', 
                                    onClick: () => handleItemAction('dismiss', item.id), 
                                    danger: true 
                                  },
                                ]}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CHCardContent>
          </CHCard>
        </div>
      </main>
    </div>
  );
}