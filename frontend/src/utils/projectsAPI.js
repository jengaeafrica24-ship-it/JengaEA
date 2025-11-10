// Mock project types and locations until backend endpoints are ready
export const getProjectTypes = () => Promise.resolve({ 
  data: [
    { id: 1, name: 'Residential' },
    { id: 2, name: 'Commercial' },
    { id: 3, name: 'Industrial' }
  ]
});

export const getLocations = () => Promise.resolve({ 
  data: [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret'
  ]
});