import React from 'react';
import Card from './Card';
import Button from './Button';
import { cn } from '../../utils/helpers';

const ProjectCard = ({
  title,
  description,
  icon: Icon,
  color = 'bg-sky-100',
  href = '#',
  tags = [],
  featured = false,
  className = '',
  onStart, // optional click handler for Start Estimate
  loading = false,
  startLabel = 'Start Estimate'
}) => {
  return (
    <Card className={cn('h-full flex flex-col justify-between', className)}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`${color} p-3 rounded-lg flex items-center justify-center`}>
              {Icon ? <Icon className="w-6 h-6 text-white" /> : null}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          </div>
          {featured && (
            <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">Featured</div>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          {onStart ? (
            <Button onClick={() => onStart()} variant="primary" className="px-4 py-2" disabled={!!loading}>
              {loading ? 'Starting...' : startLabel}
            </Button>
          ) : (
            <Button as="a" href={href} variant="primary" className="px-4 py-2">
              {startLabel}
            </Button>
          )}
          <a href={href} className="text-sm text-gray-500 hover:text-gray-700 ml-3">Learn more</a>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
