import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'John Kamau',
    role: 'Construction Manager',
    company: 'BuildRight Kenya',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'JengaEafrica has revolutionized how we handle cost estimates. The accuracy and speed are incredible!',
    rating: 5
  },
  {
    name: 'Sarah Omondi',
    role: 'Architect',
    company: 'Modern Designs Ltd',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    content: 'The location-based pricing feature is a game-changer. It helps us provide accurate quotes across different counties.',
    rating: 5
  },
  {
    name: 'David Mwangi',
    role: 'Project Manager',
    company: 'Construct Masters',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    content: "We've reduced our estimation time by 70% while maintaining high accuracy. Highly recommended!",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-950 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-orange-500 tracking-wider uppercase mb-4 animate-fadeInUp">Testimonials</span>
          <h2 className="text-4xl font-bold mb-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            What Our Clients Say
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto rounded-full animate-fadeInUp" style={{ animationDelay: '0.4s' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative group p-8 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 animate-fadeInUp"
              style={{ animationDelay: `${0.6 + (index * 0.2)}s` }}
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-orange-500/20" />
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-500/20"
                />
                <div>
                  <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                  <p className="text-sm text-orange-500">{testimonial.company}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;