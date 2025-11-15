import React, { useState } from 'react';
import { Filter, Plus, Search, X, MapPin, Star } from 'lucide-react';
import { CHButton } from '../ui/ch-button';
import { CHInput } from '../ui/ch-input';
import { CHBadge } from '../ui/ch-badge';
import { CHSheet } from '../ui/ch-sheet';
import { CHSwitch } from '../ui/ch-switch';
import { CHResourceCard } from '../ui/ch-resource-card';
import { CHEmpty } from '../ui/ch-empty';
import { CreateResourceDialog } from '../CreateResourceDialog';

/**
 * Resources Page
 * Modern image-forward browsing with filter sheet
 * Grid: 3-up desktop, 2-up tablet, 1-up mobile
 */

interface FilterState {
  categories: string[];
  location: string;
  availability: boolean;
  minRating: number;
}

export function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    location: '',
    availability: false,
    minRating: 0,
  });
  
  // Temp filter state (used in sheet before applying)
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  
  // Sample resource data
  const resources = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=450&fit=crop',
      category: 'Library',
      title: 'Wells Library - Main Study Hall',
      location: 'Wells Library, Floor 1',
      rating: 4.8,
      ratingCount: 234,
      status: 'available' as const,
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop',
      category: 'Lab',
      title: 'Luddy Hall - Computer Science Lab 2150',
      location: 'Luddy Hall, Floor 2',
      rating: 4.9,
      ratingCount: 156,
      status: 'available' as const,
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop',
      category: 'Study Room',
      title: 'Student Union - Group Study Room A',
      location: 'Student Union, Floor 2',
      rating: 4.6,
      ratingCount: 89,
      status: 'unavailable' as const,
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=450&fit=crop',
      category: 'Conference Room',
      title: 'IMU Conference Center - Room B',
      location: 'Indiana Memorial Union, Floor 3',
      rating: 4.7,
      ratingCount: 124,
      status: 'available' as const,
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=450&fit=crop',
      category: 'Library',
      title: 'Fine Arts Library - Reading Room',
      location: 'Fine Arts Building, Floor 2',
      rating: 4.9,
      ratingCount: 78,
      status: 'available' as const,
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&h=450&fit=crop',
      category: 'Lab',
      title: 'Chemistry Research Lab - East Wing',
      location: 'Chemistry Building, Floor 3',
      rating: 4.5,
      ratingCount: 45,
      status: 'unavailable' as const,
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=450&fit=crop',
      category: 'Study Room',
      title: 'Kelley School - MBA Study Lounge',
      location: 'Kelley School of Business, Floor 1',
      rating: 4.8,
      ratingCount: 167,
      status: 'available' as const,
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=450&fit=crop',
      category: 'Equipment',
      title: 'AV Equipment - Projector & Screen Kit',
      location: 'Media Services Center',
      rating: 4.4,
      ratingCount: 92,
      status: 'available' as const,
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1497366672149-e5e4b4d34eb3?w=800&h=450&fit=crop',
      category: 'Conference Room',
      title: 'Global & International Studies Building - Conference Suite',
      location: 'GISB, Floor 4',
      rating: 4.9,
      ratingCount: 203,
      status: 'available' as const,
    },
  ];
  
  // Category options
  const categoryOptions = [
    { id: 'library', label: 'Library' },
    { id: 'lab', label: 'Lab' },
    { id: 'study-room', label: 'Study Room' },
    { id: 'conference-room', label: 'Conference Room' },
    { id: 'equipment', label: 'Equipment' },
  ];
  
  // Location options
  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'wells', label: 'Wells Library' },
    { value: 'luddy', label: 'Luddy Hall' },
    { value: 'union', label: 'Student Union' },
    { value: 'imu', label: 'Indiana Memorial Union' },
    { value: 'kelley', label: 'Kelley School of Business' },
  ];
  
  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.location) count++;
    if (filters.availability) count++;
    if (filters.minRating > 0) count++;
    return count;
  };
  
  // Get filter chips
  const getFilterChips = () => {
    const chips: Array<{ id: string; label: string }> = [];
    
    // Category chips
    filters.categories.forEach((cat) => {
      const option = categoryOptions.find(o => o.id === cat);
      if (option) {
        chips.push({ id: `category-${cat}`, label: option.label });
      }
    });
    
    // Location chip
    if (filters.location) {
      const option = locationOptions.find(o => o.value === filters.location);
      if (option) {
        chips.push({ id: 'location', label: option.label });
      }
    }
    
    // Availability chip
    if (filters.availability) {
      chips.push({ id: 'availability', label: 'Available Only' });
    }
    
    // Rating chip
    if (filters.minRating > 0) {
      chips.push({ id: 'rating', label: `${filters.minRating}+ Stars` });
    }
    
    return chips;
  };
  
  // Remove filter chip
  const removeFilterChip = (chipId: string) => {
    if (chipId.startsWith('category-')) {
      const cat = chipId.replace('category-', '');
      setFilters({
        ...filters,
        categories: filters.categories.filter(c => c !== cat),
      });
    } else if (chipId === 'location') {
      setFilters({ ...filters, location: '' });
    } else if (chipId === 'availability') {
      setFilters({ ...filters, availability: false });
    } else if (chipId === 'rating') {
      setFilters({ ...filters, minRating: 0 });
    }
  };
  
  // Toggle category in temp filters
  const toggleCategory = (categoryId: string) => {
    if (tempFilters.categories.includes(categoryId)) {
      setTempFilters({
        ...tempFilters,
        categories: tempFilters.categories.filter(c => c !== categoryId),
      });
    } else {
      setTempFilters({
        ...tempFilters,
        categories: [...tempFilters.categories, categoryId],
      });
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    const emptyFilters: FilterState = {
      categories: [],
      location: '',
      availability: false,
      minRating: 0,
    };
    setTempFilters(emptyFilters);
  };
  
  // Apply filters
  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterSheetOpen(false);
  };
  
  // Open filter sheet
  const openFilterSheet = () => {
    setTempFilters(filters); // Copy current filters to temp
    setFilterSheetOpen(true);
  };
  
  const filterChips = getFilterChips();
  const activeFilterCount = getActiveFilterCount();
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-1">Resources</h1>
          <p className="text-caption text-fg-muted">
            Browse and book campus resources including study rooms, labs, and equipment
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <CHButton
            variant="secondary"
            size="md"
            onClick={openFilterSheet}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <CHBadge variant="info">{activeFilterCount}</CHBadge>
            )}
          </CHButton>
          
          <CHButton
            variant="primary"
            size="md"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Resource
          </CHButton>
        </div>
      </div>
      
      {/* Search Area */}
      <section className="section-spacing">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <CHInput
            placeholder="Search resources by name, location, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {/* Filter Chips */}
          {filterChips.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-caption text-fg-muted">Active filters:</span>
              
              {filterChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => removeFilterChip(chip.id)}
                  className="
                    inline-flex items-center gap-2 px-3 py-1
                    bg-subtle border border-default rounded-md
                    text-caption text-fg-default
                    hover:bg-[#EEEDEB] transition-colors
                  "
                >
                  {chip.label}
                  <X className="w-3 h-3" />
                </button>
              ))}
              
              <button
                onClick={() => setFilters({
                  categories: [],
                  location: '',
                  availability: false,
                  minRating: 0,
                })}
                className="text-caption text-brand-crimson hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>
      
      {/* Resource Grid - 3-up desktop, 2-up tablet, 1-up mobile */}
      <section className="section-spacing">
        {resources.length === 0 ? (
          <CHEmpty
            icon={<Search className="w-8 h-8 text-fg-muted" />}
            title="No resources found"
            description="Try adjusting your filters or search query to find what you're looking for."
            action={
              <CHButton
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    categories: [],
                    location: '',
                    availability: false,
                    minRating: 0,
                  });
                }}
              >
                Clear Filters
              </CHButton>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <CHResourceCard
                key={resource.id}
                image={resource.image}
                category={resource.category}
                title={resource.title}
                location={resource.location}
                rating={resource.rating}
                ratingCount={resource.ratingCount}
                status={resource.status}
                onClick={() => console.log('View resource:', resource.id)}
                onView={() => console.log('Quick view:', resource.id)}
                onEdit={() => console.log('Edit resource:', resource.id)}
                onDuplicate={() => console.log('Duplicate resource:', resource.id)}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Filter Sheet */}
      <CHSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Resources"
      >
        <div className="flex flex-col gap-6">
          {/* Category Section */}
          <div className="flex flex-col gap-3">
            <h4 className="text-caption-semibold text-fg-default">Category</h4>
            
            <div className="flex flex-col gap-2">
              {categoryOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tempFilters.categories.includes(option.id)}
                    onChange={() => toggleCategory(option.id)}
                    className="w-4 h-4 rounded border-default text-brand-crimson focus:ring-2 focus:ring-brand-crimson cursor-pointer"
                  />
                  <span className="text-caption text-fg-default">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Separator */}
          <div className="h-px bg-border-muted" />
          
          {/* Location Section */}
          <div className="flex flex-col gap-3">
            <h4 className="text-caption-semibold text-fg-default">Location</h4>
            
            <select
              value={tempFilters.location}
              onChange={(e) => setTempFilters({ ...tempFilters, location: e.target.value })}
              className="
                h-10 px-3 py-2 pr-10 w-full
                bg-surface border border-default rounded-md
                text-caption text-fg-default
                appearance-none cursor-pointer
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-brand-crimson focus:border-transparent
              "
            >
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Separator */}
          <div className="h-px bg-border-muted" />
          
          {/* Availability Section */}
          <div className="flex flex-col gap-3">
            <h4 className="text-caption-semibold text-fg-default">Availability</h4>
            
            <CHSwitch
              label="Show only available resources"
              checked={tempFilters.availability}
              onCheckedChange={(checked) => setTempFilters({ ...tempFilters, availability: checked })}
            />
          </div>
          
          {/* Separator */}
          <div className="h-px bg-border-muted" />
          
          {/* Rating Section */}
          <div className="flex flex-col gap-3">
            <h4 className="text-caption-semibold text-fg-default">Minimum Rating</h4>
            
            <div className="flex flex-col gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={tempFilters.minRating === rating}
                    onChange={() => setTempFilters({ ...tempFilters, minRating: rating })}
                    className="w-4 h-4 border-default text-brand-crimson focus:ring-2 focus:ring-brand-crimson cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    {rating === 0 ? (
                      <span className="text-caption text-fg-default">Any rating</span>
                    ) : (
                      <>
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="text-caption text-fg-default">
                          {rating}+ stars
                        </span>
                      </>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-muted">
            <CHButton
              variant="secondary"
              className="flex-1"
              onClick={resetFilters}
            >
              Reset
            </CHButton>
            <CHButton
              variant="primary"
              className="flex-1"
              onClick={applyFilters}
            >
              Apply Filters
            </CHButton>
          </div>
        </div>
      </CHSheet>
      
      {/* Create Resource Dialog */}
      <CreateResourceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}