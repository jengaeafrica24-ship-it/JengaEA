import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import Carousel2 from '../components/common/Carousel2';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-blue-950 to-blue-900">
      <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-blue-900/5 to-transparent">
        <HeroSection />
        {/* Image carousel with actual African construction images */}
        <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <Carousel2
            autoplayInterval={5000}
            slides={[
              {
                image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=2000&q=80',
                title: 'Modern Construction in East Africa',
                description: 'Building the future of East African infrastructure with precision and innovation across Kenya, Tanzania, and Uganda',
              },
              {
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
                title: 'Urban Development in Nairobi',
                description: 'Transforming East African cities with sustainable construction practices and modern architecture',
              },
              {
                image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80',
                title: 'Residential Construction Projects',
                description: 'Creating quality homes and communities across East Africa\'s growing urban centers',
              },
              {
                image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2000&q=80',
                title: 'Commercial Building Development',
                description: 'State-of-the-art commercial spaces supporting East Africa\'s rapidly growing economy',
              },
              {
                image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2000&q=80',
                title: 'Infrastructure Development',
                description: 'Building roads, bridges, and essential infrastructure to connect East African communities',
              },
              {
                image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=2000&q=80',
                title: 'Construction Site Management',
                description: 'Professional construction management practices driving quality projects across the region',
              },
            ]}
          />
        </div>
        <FeaturesSection />
        <HowItWorksSection />
      </div>
    </div>
  );
}
