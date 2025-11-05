import React, { useEffect, useState } from 'react';
import { Search, Home, Briefcase, Map, Play } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProjectCard from '../components/common/ProjectCard';
import { projectsAPI, estimatesAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StartEstimateModal from '../components/common/StartEstimateModal';

const ProjectSelectionPage = () => {
  const [templates, setTemplates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingTemplate, setStartingTemplate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tResp = await projectsAPI.getProjectTemplates();
        const lResp = await projectsAPI.getLocations();
        const templatesData = Array.isArray(tResp.data) ? tResp.data : (tResp.data?.results || []);
        const locationsData = Array.isArray(lResp.data) ? lResp.data : (lResp.data?.results || []);
        setTemplates(templatesData);
        setLocations(locationsData);
      } catch (err) {
        console.error('Failed to load templates or locations', err);
        toast.error('Failed to load templates. Try refreshing.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openStartModal = (template) => {
    setStartingTemplate(template);
    setModalOpen(true);
  };

  const handleConfirmStart = async ({ location, total_area }) => {
    // Called when modal confirm pressed
    if (!startingTemplate) return;
    setCreating(true);
    try {
      const payload = {
        project_template: startingTemplate.id,
        project_name: startingTemplate.name,
        project_description: startingTemplate.description || '',
        total_area: total_area || startingTemplate.total_area || 100,
        location: location,
      };

      const { data } = await estimatesAPI.createEstimate(payload);
      toast.success('Estimate started');
      setModalOpen(false);
      // navigate to estimate editor
      navigate(`/estimate/${data.id}`);
    } catch (err) {
      console.error('Failed to start estimate', err);
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to start estimate';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Project Templates</h1>
        <p className="mt-2 text-gray-600 max-w-2xl">Pick a template to jumpstart your estimate — fully customizable to your site and materials.</p>
      </div>

      {/* Search and Filters - refined */}
      <div className="mb-8">
        <Card>
          <Card.Body>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-4">
              <div className="flex-1">
                <Input placeholder="Search templates, features or keywords..." icon={Search} />
              </div>

              <div className="flex items-center space-x-3">
                <select className="input">
                  <option value="">All Categories</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="infrastructure">Infrastructure</option>
                </select>

                <select className="input">
                  <option value="">All Locations</option>
                  <option value="kenya">Kenya</option>
                  <option value="uganda">Uganda</option>
                  <option value="tanzania">Tanzania</option>
                </select>

                <Button variant="secondary">Sort</Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates && templates.length > 0 ? (
          templates.map((tpl) => (
            <ProjectCard
              key={tpl.id}
              title={tpl.name}
              description={tpl.description}
              icon={tpl.icon ? Home : Home}
              color={tpl.color || 'bg-sky-500'}
              tags={[tpl.category || 'Template']}
              onStart={() => openStartModal(tpl)}
              loading={creating && startingTemplate?.id === tpl.id}
            />
          ))
        ) : (
          /* Fallback static cards when templates not available */
          <>
            <ProjectCard
              title="3-Bedroom House"
              description="Typical single-family home with foundation, framing and finishes"
              icon={Home}
              color="bg-sky-500"
              href="/estimate/new?template=3-bedroom"
              tags={["Residential", "Medium"]}
              featured
            />

            <ProjectCard
              title="Commercial Office Block"
              description="Multi-storey office building with core & shell estimate"
              icon={Briefcase}
              color="bg-green-500"
              href="/estimate/new?template=office-block"
              tags={["Commercial", "Large"]}
            />

            <ProjectCard
              title="Perimeter Wall"
              description="Boundary wall with concrete footing and plaster finishes"
              icon={Map}
              color="bg-indigo-500"
              href="/estimate/new?template=perimeter-wall"
              tags={["Infrastructure", "Small"]}
            />
          </>
        )}
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-600 mb-4">Don't see a template that fits? Create a custom project with your own parameters.</p>
        <Button variant="secondary">Create Custom Project</Button>
      </div>

      {/* Start Estimate modal */}
      {startingTemplate && (
        <StartEstimateModal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          template={startingTemplate}
          locations={locations}
          defaultLocationId={user?.profile?.location || (locations[0]?.id ?? null)}
          onConfirm={handleConfirmStart}
          loading={creating}
        />
      )}
    </div>
  );
};

export default ProjectSelectionPage;



