import React, { useState } from 'react';
import { MapPin, Star, Eye, Edit2, Copy } from 'lucide-react';
import { CHBadge } from './ch-badge';
import { CHButton } from './ch-button';

/**
 * CH/ResourceCard - REFINED
 * Image-forward resource card with hover interactions and consistent spacing
 * - 16:9 image with object-fit: cover
 * - Hover: opacity 0.92 + soft overlay + reveal quick actions (View/Edit/Duplicate)
 * - Availability badge in top-right with drop shadow
 * - Location + rating spacing: 6px (gap-1.5)
 * - Icons align to 4pt grid
 * - Max width: 380px for consistent rhythm at 1440px
 */

export interface CHResourceCardProps {
  image: string;
  category: string;
  title: string;
  location: string;
  rating: number;
  ratingCount?: number;
  status: 'available' | 'unavailable';
  onClick?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
}

export function CHResourceCard({
  image,
  category,
  title,
  location,
  rating,
  ratingCount,
  status,
  onClick,
  onView,
  onEdit,
  onDuplicate,
}: CHResourceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const statusVariant = status === 'available' ? 'success' : 'danger';
  const statusLabel = status === 'available' ? 'Available' : 'Unavailable';
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="
        flex flex-col bg-surface border border-default rounded-lg overflow-hidden
        shadow-sm hover:shadow-md
        transition-all duration-200
        hover:scale-[1.01]
        cursor-pointer
        h-full
      "
    >
      {/* Image Container - 16:9 aspect ratio */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {/* Image with hover opacity */}
        <img
          src={image}
          alt={title}
          className="
            absolute inset-0 w-full h-full 
            object-cover
            transition-opacity duration-200
          "
          style={{ opacity: isHovered ? 0.92 : 1 }}
        />
        
        {/* Soft Overlay on Hover */}
        <div 
          className="
            absolute inset-0 bg-black/10
            transition-opacity duration-200
          "
          style={{ opacity: isHovered ? 1 : 0 }}
        />
        
        {/* Status Badge - Top Right with Drop Shadow */}
        <div 
          className="absolute top-3 right-3"
          style={{ 
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
          }}
        >
          <CHBadge variant={statusVariant}>{statusLabel}</CHBadge>
        </div>
        
        {/* Quick Actions - Revealed on Hover */}
        <div 
          className="
            absolute top-3 left-3
            flex items-center gap-2
            transition-all duration-200
          "
          style={{ 
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(-8px)',
          }}
        >
          <CHButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView?.();
            }}
            className="bg-white/90 hover:bg-white shadow-sm"
          >
            <Eye className="w-4 h-4" strokeWidth={2} />
          </CHButton>
          
          <CHButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="bg-white/90 hover:bg-white shadow-sm"
          >
            <Edit2 className="w-4 h-4" strokeWidth={2} />
          </CHButton>
          
          <CHButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.();
            }}
            className="bg-white/90 hover:bg-white shadow-sm"
          >
            <Copy className="w-4 h-4" strokeWidth={2} />
          </CHButton>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Category Overline */}
        <p className="text-micro-semibold uppercase tracking-wider text-fg-muted">
          {category}
        </p>
        
        {/* Title - 2-line clamp */}
        <h3 className="text-caption-semibold text-fg-default line-clamp-2">
          {title}
        </h3>
        
        {/* Location & Rating - 6px spacing, 4pt grid alignment */}
        <div className="flex flex-col gap-1.5">
          {/* Location Row */}
          <div className="flex items-center gap-2 text-caption text-fg-muted">
            <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
            <span className="truncate">{location}</span>
          </div>
          
          {/* Rating Row */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" strokeWidth={2} />
              <span className="text-caption-semibold text-fg-default">
                {rating.toFixed(1)}
              </span>
            </div>
            {ratingCount !== undefined && (
              <span className="text-caption text-fg-muted">
                ({ratingCount})
              </span>
            )}
          </div>
        </div>
        
        {/* CTA Area Reserved - Empty for now */}
        <div className="mt-auto" />
      </div>
    </div>
  );
}