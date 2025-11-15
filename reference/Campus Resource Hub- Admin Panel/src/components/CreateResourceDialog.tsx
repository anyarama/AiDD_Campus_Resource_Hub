import React, { useState } from 'react';
import { Upload, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { CHDialog } from './ui/ch-dialog';
import { CHButton } from './ui/ch-button';
import { CHInput } from './ui/ch-input';
import { CHTextarea } from './ui/ch-textarea';
import { CHSelect } from './ui/ch-select';

/**
 * Create Resource Dialog
 * Form for adding new campus resources
 */

interface CreateResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateResourceDialog({ open, onOpenChange }: CreateResourceDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    building: '',
    floor: '',
    capacity: '',
    description: '',
    amenities: [] as string[],
    availability: 'available',
    hourlyRate: '',
    image: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create resource:', formData);
    // TODO: API call to create resource
    onOpenChange(false);
    // Reset form
    setFormData({
      title: '',
      category: '',
      location: '',
      building: '',
      floor: '',
      capacity: '',
      description: '',
      amenities: [],
      availability: 'available',
      hourlyRate: '',
      image: null,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const categories = [
    { value: 'library', label: 'Library' },
    { value: 'lab', label: 'Lab' },
    { value: 'study-room', label: 'Study Room' },
    { value: 'conference-room', label: 'Conference Room' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'classroom', label: 'Classroom' },
    { value: 'other', label: 'Other' },
  ];

  const buildings = [
    { value: 'wells', label: 'Wells Library' },
    { value: 'luddy', label: 'Luddy Hall' },
    { value: 'imu', label: 'Indiana Memorial Union' },
    { value: 'student-union', label: 'Student Union' },
    { value: 'chemistry', label: 'Chemistry Building' },
    { value: 'fine-arts', label: 'Fine Arts Building' },
    { value: 'ballantine', label: 'Ballantine Hall' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <CHDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Resource"
      description="Add a new campus resource for students and staff to book"
      maxWidth="xl"
      footer={
        <>
          <CHButton variant="secondary" onClick={handleCancel}>
            Cancel
          </CHButton>
          <CHButton variant="primary" onClick={handleSubmit}>
            Create Resource
          </CHButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Resource Image Upload */}
        <div className="space-y-1.5">
          <label className="text-caption-semibold text-fg-default">
            Resource Image
          </label>
          <div className="border-2 border-dashed border-border-default rounded-lg p-3 text-center hover:border-brand-crimson transition-colors cursor-pointer">
            <Upload className="w-5 h-5 mx-auto mb-1.5 text-fg-muted" />
            <p className="text-caption text-fg-default mb-0.5">
              Click to upload or drag and drop
            </p>
            <p className="text-caption text-fg-muted">
              PNG, JPG up to 10MB
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFormData({ ...formData, image: e.target.files[0] });
                }
              }}
            />
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <CHInput
              label="Resource Title"
              placeholder="e.g., Wells Library - Main Study Hall"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <CHSelect
            label="Category"
            placeholder="Select category"
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
            options={categories}
            required
          />

          <CHSelect
            label="Building"
            placeholder="Select building"
            value={formData.building}
            onChange={(value) => setFormData({ ...formData, building: value })}
            options={buildings}
            required
          />
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <CHInput
              label="Room/Location"
              placeholder="e.g., Floor 1, Room 101"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              icon={<MapPin className="w-4 h-4" />}
              required
            />
          </div>

          <CHInput
            label="Floor"
            placeholder="e.g., 1, 2, 3"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
          />
        </div>

        {/* Capacity & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CHInput
            label="Capacity"
            type="number"
            placeholder="e.g., 8"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            icon={<Users className="w-4 h-4" />}
          />

          <CHSelect
            label="Availability Status"
            value={formData.availability}
            onChange={(value) => setFormData({ ...formData, availability: value })}
            options={[
              { value: 'available', label: 'Available' },
              { value: 'unavailable', label: 'Unavailable' },
              { value: 'maintenance', label: 'Under Maintenance' },
            ]}
            required
          />
        </div>

        {/* Description */}
        <CHTextarea
          label="Description"
          placeholder="Provide a detailed description of the resource, including amenities, special features, and booking guidelines..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />

        {/* Amenities */}
        <fieldset className="space-y-1.5 border-0 p-0">
          <legend className="text-caption-semibold text-fg-default">
            Amenities
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              'Whiteboard',
              'Projector',
              'Wi-Fi',
              'Power Outlets',
              'Computer',
              'Audio/Video',
              'Natural Light',
              'Accessibility',
              'Printer/Scanner',
            ].map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2 p-2 border border-border-default rounded-md hover:border-brand-crimson cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        amenities: [...formData.amenities, amenity],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        amenities: formData.amenities.filter((a) => a !== amenity),
                      });
                    }
                  }}
                  className="w-4 h-4 rounded border-default text-brand-crimson focus:ring-2 focus:ring-brand-crimson cursor-pointer"
                />
                <span className="text-caption text-fg-default">{amenity}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Pricing */}
        <CHInput
          label="Hourly Rate (Optional)"
          type="number"
          placeholder="0.00"
          value={formData.hourlyRate}
          onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
          icon={<DollarSign className="w-4 h-4" />}
          helperText="Leave blank for free resources"
        />

        {/* Booking Hours */}
        <div className="space-y-1.5">
          <label className="text-caption-semibold text-fg-default flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Booking Hours
          </label>
          <div className="grid grid-cols-2 gap-3">
            <CHInput
              label="Start Time"
              type="time"
              value=""
              onChange={() => {}}
            />
            <CHInput
              label="End Time"
              type="time"
              value=""
              onChange={() => {}}
            />
          </div>
        </div>

        {/* Helper text */}
        <div className="bg-subtle border border-border-muted rounded-lg p-2.5">
          <p className="text-caption text-fg-muted">
            <strong className="text-fg-default">Note:</strong> All resources are subject to approval by campus administrators. 
            You will receive a confirmation email once your resource has been reviewed.
          </p>
        </div>
      </form>
    </CHDialog>
  );
}