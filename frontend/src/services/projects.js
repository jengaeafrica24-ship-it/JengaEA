import api from './api';

// Mock data for development
const mockProjectTypes = [
  { id: 1, name: 'Residential' },
  { id: 2, name: 'Commercial' },
  { id: 3, name: 'Industrial' }
];

const mockLocations = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret'
];

const mockTemplates = [
  {
    id: 1,
    name: 'Basic House',
    type: 'Residential',
    description: 'Simple single-family home template',
    thumbnail: '/templates/basic-house.jpg'
  },
  {
    id: 2,
    name: 'Office Building',
    type: 'Commercial',
    description: 'Standard office building template',
    thumbnail: '/templates/office-building.jpg'
  },
  {
    id: 3,
    name: 'Warehouse',
    type: 'Industrial',
    description: 'Basic warehouse template',
    thumbnail: '/templates/warehouse.jpg'
  }
];

export const getProjectTypes = () => 
  process.env.NODE_ENV === 'development'
    ? Promise.resolve({ data: mockProjectTypes })
    : api.get('/api/projects/types/');

export const getLocations = () =>
  process.env.NODE_ENV === 'development'
    ? Promise.resolve({ data: mockLocations })
    : api.get('/api/projects/locations/');

export const getProjectTemplates = () =>
  process.env.NODE_ENV === 'development'
    ? Promise.resolve({ data: mockTemplates })
    : api.get('/api/projects/templates/');