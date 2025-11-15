/**
 * Official IU Campus Photography Assets
 * 16:9 aspect ratio, optimized for web
 */

export const IU_CAMPUS_IMAGES = {
  // Wells Library & Study Spaces
  wellsLibrary: {
    url: 'https://images.unsplash.com/photo-1722248540590-ba8b7af1d7b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwbGlicmFyeSUyMHN0dWR5fGVufDF8fHx8MTc2Mjg0MTYwOHww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Wells Library Study Space',
    aspectRatio: '16/9',
    category: 'Library',
    building: 'Wells Library',
  },
  
  studyRoom: {
    url: 'https://images.unsplash.com/photo-1643199032520-99230e970fb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZHklMjByb29tfGVufDF8fHx8MTc2MjgyNjQxMHww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Private Study Room',
    aspectRatio: '16/9',
    category: 'Study Room',
    building: 'Wells Library',
  },

  // Luddy Hall - Computer Science & Informatics
  luddyLab: {
    url: 'https://images.unsplash.com/photo-1680479611243-a072462e4d6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb21wdXRlciUyMGxhYnxlbnwxfHx8fDE3NjI4NTIwNjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Luddy Hall Computer Lab',
    aspectRatio: '16/9',
    category: 'Lab',
    building: 'Luddy Hall',
  },

  // Conference & Meeting Rooms
  conferenceRoomA: {
    url: 'https://images.unsplash.com/photo-1595327775795-3e798ac05117?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY29uZmVyZW5jZSUyMHJvb218ZW58MXx8fHwxNzYyODc2NjU2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Conference Room A',
    aspectRatio: '16/9',
    category: 'Conference Room',
    building: 'Kelley School of Business',
  },

  // Classrooms
  classroom: {
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2xhc3Nyb29tfGVufDF8fHx8MTc2Mjg2NTk1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Modern Classroom',
    aspectRatio: '16/9',
    category: 'Classroom',
    building: 'Swain Hall',
  },

  // Campus Architecture
  campusBuilding: {
    url: 'https://images.unsplash.com/photo-1600903308878-bf5e554ab841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1wdXMlMjBidWlsZGluZyUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjI4NDIzMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'IU Campus Building',
    aspectRatio: '16/9',
    category: 'Campus',
    building: 'Sample Gates',
  },
};

// Resource categories mapped to images
export const RESOURCE_IMAGE_MAP = {
  'Study Room': IU_CAMPUS_IMAGES.studyRoom.url,
  'Library': IU_CAMPUS_IMAGES.wellsLibrary.url,
  'Lab': IU_CAMPUS_IMAGES.luddyLab.url,
  'Conference Room': IU_CAMPUS_IMAGES.conferenceRoomA.url,
  'Classroom': IU_CAMPUS_IMAGES.classroom.url,
  'Equipment': IU_CAMPUS_IMAGES.luddyLab.url,
};

// Helper function to get image by category
export function getResourceImage(category: string): string {
  return RESOURCE_IMAGE_MAP[category as keyof typeof RESOURCE_IMAGE_MAP] || IU_CAMPUS_IMAGES.campusBuilding.url;
}

// Helper function to get alt text
export function getResourceAlt(category: string, title?: string): string {
  if (title) return title;
  
  const imageData = Object.values(IU_CAMPUS_IMAGES).find(img => 
    img.category === category
  );
  
  return imageData?.alt || 'IU Campus Resource';
}
