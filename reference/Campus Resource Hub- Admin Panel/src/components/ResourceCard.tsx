import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { IUBadge } from './IUBadge';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface Resource {
  id: string;
  title: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  status: 'available' | 'draft' | 'archived';
  image: string;
}

interface ResourceCardProps {
  resource: Resource;
  onClick?: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const statusVariants = {
    available: 'success' as const,
    draft: 'warning' as const,
    archived: 'neutral' as const
  };
  
  const statusLabels = {
    available: 'Available',
    draft: 'Draft',
    archived: 'Archived'
  };
  
  return (
    <div
      onClick={onClick}
      className="bg-iu-surface rounded-[var(--radius-lg)] border border-iu overflow-hidden transition-all hover:shadow-iu-md hover:-translate-y-1 cursor-pointer group"
    >
      {/* Image */}
      <div className="aspect-video bg-[var(--iu-surface-muted)] overflow-hidden">
        <ImageWithFallback
          src={resource.image}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h5 className="text-iu-primary flex-1">{resource.title}</h5>
          <IUBadge variant={statusVariants[resource.status]}>
            {statusLabels[resource.status]}
          </IUBadge>
        </div>
        
        <p className="text-sm text-iu-secondary mb-3">{resource.category}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-iu-secondary">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{resource.location}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-[var(--iu-warning)] text-[var(--iu-warning)]" />
            <span className="text-sm text-iu-primary">{resource.rating.toFixed(1)}</span>
            <span className="text-sm text-iu-secondary">({resource.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
