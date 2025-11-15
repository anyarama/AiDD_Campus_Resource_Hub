import React from 'react';
import { Image as ImageIcon, Download } from 'lucide-react';
import { IUButton } from '../IUButton';
import { IUCard, IUCardHeader, IUCardTitle, IUCardContent } from '../IUCard';

/**
 * BRAND ASSETS
 * Indiana University brand assets including logo and campus photography
 */

export function BrandAssets() {
  const campusPhotos = [
    { 
      id: 1, 
      name: 'Wells Library', 
      location: 'Bloomington Campus',
      description: 'Iconic Wells Library - main research library',
      placeholder: true
    },
    { 
      id: 2, 
      name: 'Luddy Hall', 
      location: 'Bloomington Campus',
      description: 'Modern Luddy Hall - School of Informatics',
      placeholder: true
    },
    { 
      id: 3, 
      name: 'Study Room', 
      location: 'Student Union',
      description: 'Collaborative study space with modern furniture',
      placeholder: true
    },
    { 
      id: 4, 
      name: 'Research Lab', 
      location: 'Science Building',
      description: 'State-of-the-art research laboratory',
      placeholder: true
    },
    { 
      id: 5, 
      name: 'Campus Courtyard', 
      location: 'Central Campus',
      description: 'Students studying in outdoor courtyard',
      placeholder: true
    },
    { 
      id: 6, 
      name: 'Lecture Hall', 
      location: 'Academic Building',
      description: 'Modern lecture hall with technology',
      placeholder: true
    },
  ];
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 mb-2">Brand Assets</h1>
        <p className="text-body text-fg-muted">
          Official Indiana University brand assets for use in Campus Hub. Includes IU brick logo and campus photography.
        </p>
      </div>
      
      {/* IU Logo Section */}
      <section className="section-spacing">
        <h2 className="text-h2 mb-4">IU Brick Logo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Logo */}
          <IUCard>
            <IUCardHeader>
              <IUCardTitle>Primary Logo (Light Background)</IUCardTitle>
            </IUCardHeader>
            <IUCardContent>
              <div className="bg-surface border border-default rounded-md p-12 mb-4 flex items-center justify-center min-h-[200px]">
                {/* Placeholder for official IU brick logo */}
                <div className="text-center">
                  <div className="w-32 h-32 bg-brand-crimson rounded-md mb-4 mx-auto flex items-center justify-center">
                    <span className="text-h1 text-brand-white">IU</span>
                  </div>
                  <p className="text-caption text-fg-subtle">Placeholder - Replace with official IU brick logo SVG</p>
                </div>
              </div>
              <div className="flex gap-2">
                <IUButton variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </IUButton>
                <IUButton variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </IUButton>
              </div>
            </IUCardContent>
          </IUCard>
          
          {/* Inverse Logo */}
          <IUCard>
            <IUCardHeader>
              <IUCardTitle>Inverse Logo (Dark Background)</IUCardTitle>
            </IUCardHeader>
            <IUCardContent>
              <div className="bg-brand-crimson border border-brand-crimson rounded-md p-12 mb-4 flex items-center justify-center min-h-[200px]">
                {/* Placeholder for official IU brick logo (inverse) */}
                <div className="text-center">
                  <div className="w-32 h-32 bg-brand-white rounded-md mb-4 mx-auto flex items-center justify-center">
                    <span className="text-h1 text-brand-crimson">IU</span>
                  </div>
                  <p className="text-caption text-brand-cream">Placeholder - Replace with official IU brick logo SVG (inverse)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <IUButton variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </IUButton>
                <IUButton variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </IUButton>
              </div>
            </IUCardContent>
          </IUCard>
        </div>
        
        {/* Logo Guidelines */}
        <IUCard>
          <IUCardHeader>
            <IUCardTitle>Logo Usage Guidelines</IUCardTitle>
          </IUCardHeader>
          <IUCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-h4 mb-3">Clear Space</h4>
                <p className="text-caption text-fg-muted mb-2">
                  Maintain minimum clear space equal to the height of the "I" in the IU logo on all sides.
                </p>
              </div>
              <div>
                <h4 className="text-h4 mb-3">Minimum Size</h4>
                <p className="text-caption text-fg-muted mb-2">
                  Logo should not be reproduced smaller than 24px in height for digital applications.
                </p>
              </div>
              <div>
                <h4 className="text-h4 mb-3">Color Usage</h4>
                <p className="text-caption text-fg-muted mb-2">
                  Use IU Crimson (#990000) on light backgrounds, white on dark backgrounds. No other colors permitted.
                </p>
              </div>
              <div>
                <h4 className="text-h4 mb-3">Placement</h4>
                <p className="text-caption text-fg-muted mb-2">
                  Sidebar header, footer lockup, and as page identifier. Always maintain proper aspect ratio.
                </p>
              </div>
            </div>
          </IUCardContent>
        </IUCard>
      </section>
      
      {/* Campus Photography Section */}
      <section className="section-spacing">
        <h2 className="text-h2 mb-4">Campus Photography</h2>
        
        <p className="text-body text-fg-muted mb-6">
          Official IU campus photography for use in resource cards, headers, and marketing materials. All images are in 16:9 aspect ratio.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campusPhotos.map((photo) => (
            <IUCard key={photo.id} className="overflow-hidden">
              {/* 16:9 Image Container */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 bg-subtle flex items-center justify-center">
                  {photo.placeholder && (
                    <div className="text-center p-6">
                      <ImageIcon className="w-12 h-12 text-fg-subtle mx-auto mb-2" />
                      <p className="text-caption text-fg-subtle">16:9 Placeholder</p>
                      <p className="text-micro text-fg-subtle mt-1">{photo.name}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Card Content */}
              <IUCardContent>
                <h4 className="text-h4 mb-1">{photo.name}</h4>
                <p className="text-caption text-fg-muted mb-2">{photo.location}</p>
                <p className="text-caption text-fg-subtle mb-4">{photo.description}</p>
                <IUButton variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </IUButton>
              </IUCardContent>
            </IUCard>
          ))}
        </div>
        
        {/* Photo Guidelines */}
        <IUCard>
          <IUCardHeader>
            <IUCardTitle>Photography Guidelines</IUCardTitle>
          </IUCardHeader>
          <IUCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-h4 mb-3">Aspect Ratio</h4>
                <p className="text-caption text-fg-muted mb-2">
                  All campus photos must be cropped to 16:9 aspect ratio for consistency across the platform.
                </p>
              </div>
              <div>
                <h4 className="text-h4 mb-3">Image Quality</h4>
                <p className="text-caption text-fg-muted mb-2">
                  Use high-resolution images (minimum 1920×1080px). Optimize for web using WebP format with fallback.
                </p>
              </div>
              <div>
                <h4 className="text-h4 mb-3">Alt Text</h4>
                <p className="text-caption text-fg-muted mb-2">
                  Always provide descriptive, meaningful alt text for accessibility. Describe the content and context.
                </p>
              </div>
              <div>
                <h4 className="text-h4 mb-3">Color Grading</h4>
                <p className="text-caption text-fg-muted mb-2">
                  Maintain warm, inviting tones. Avoid overly saturated or filtered images. Keep natural lighting.
                </p>
              </div>
            </div>
          </IUCardContent>
        </IUCard>
      </section>
      
      {/* Asset Specifications */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Asset Specifications</IUCardTitle>
        </IUCardHeader>
        <IUCardContent>
          <div className="bg-subtle rounded-md p-6">
            <h4 className="text-h4 mb-4">File Formats & Sizes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-caption-semibold mb-2">Logo Files</p>
                <ul className="space-y-1 text-caption text-fg-muted">
                  <li>• SVG (vector, preferred for web)</li>
                  <li>• PNG (transparent, 2x retina)</li>
                  <li>• Sizes: 24px, 32px, 48px, 64px height</li>
                </ul>
              </div>
              <div>
                <p className="text-caption-semibold mb-2">Photography</p>
                <ul className="space-y-1 text-caption text-fg-muted">
                  <li>• WebP (primary, optimized)</li>
                  <li>• JPG (fallback format)</li>
                  <li>• 16:9 ratio (1920×1080, 1280×720)</li>
                  <li>• Quality: 85% compression</li>
                </ul>
              </div>
            </div>
          </div>
        </IUCardContent>
      </IUCard>
    </div>
  );
}
