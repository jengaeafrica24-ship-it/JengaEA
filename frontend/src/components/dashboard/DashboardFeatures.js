import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Users, 
  FileText, 
  BarChart 
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, link }) => (
  <Link 
    to={link}
    className="bg-white rounded-lg md:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-start space-y-3 md:space-y-4 min-h-[160px] sm:min-h-[180px] group active:scale-95"
  >
    <div className="p-2.5 md:p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
      <Icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
    </div>
    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 line-clamp-2">
      {title}
    </h3>
    <p className="text-sm md:text-base text-gray-600 line-clamp-2 flex-1">
      {description}
    </p>
    <div className="flex items-center text-blue-600 font-medium text-sm md:text-base group-hover:translate-x-1 transition-transform">
      Learn more
      <svg className="w-4 h-4 md:w-5 md:h-5 ml-1.5 md:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </Link>
);

const DashboardFeatures = () => {
  const features = [
    {
      icon: Wrench,
      title: "Material Cost Estimation",
      description: "Calculate material costs for your project.",
      link: "/material-cost"
    },
    {
      icon: Users,
      title: "Labor Cost Estimation",
      description: "Estimate labor expenses based on project scope.",
      link: "/labor-cost"
    },
    {
      icon: FileText,
      title: "Project Cost Summary",
      description: "View a complete breakdown of all costs.",
      link: "/project-summary"
    },
    {
      icon: BarChart,
      title: "AI Market Analysis",
      description: "Optimize purchase timing with AI insights.",
      link: "/market-analysis"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
};

export default DashboardFeatures;