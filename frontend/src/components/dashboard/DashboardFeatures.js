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
    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col items-start space-y-4"
  >
    <div className="p-3 bg-blue-50 rounded-lg">
      <Icon className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
    <div className="flex items-center text-blue-600 font-medium">
      Learn more
      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
};

export default DashboardFeatures;