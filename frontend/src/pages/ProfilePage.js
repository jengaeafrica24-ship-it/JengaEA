import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Building, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      location: user?.location || '',
      company_name: user?.company_name || '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await updateProfile(data);
    setIsLoading(false);
    
    if (result.success) {
      // Profile updated successfully
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="First Name"
                      {...register('first_name', {
                        required: 'First name is required',
                      })}
                      error={errors.first_name?.message}
                    />
                  </div>
                  <div>
                    <Input
                      label="Last Name"
                      {...register('last_name', {
                        required: 'Last name is required',
                      })}
                      error={errors.last_name?.message}
                    />
                  </div>
                </div>

                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    disabled
                    helperText="Email cannot be changed"
                    {...register('email')}
                  />
                </div>

                <div>
                  <Input
                    label="Phone Number"
                    {...register('phone_number', {
                      required: 'Phone number is required',
                    })}
                    error={errors.phone_number?.message}
                  />
                </div>

                <div>
                  <Input
                    label="Location"
                    placeholder="e.g., Nairobi, Kenya"
                    {...register('location')}
                    error={errors.location?.message}
                  />
                </div>

                <div>
                  <Input
                    label="Company Name"
                    placeholder="Enter your company name"
                    {...register('company_name')}
                    error={errors.company_name?.message}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>

        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Account Summary</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {user?.role?.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{user?.email}</span>
                  </div>
                  
                  {user?.phone_number && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">{user?.phone_number}</span>
                    </div>
                  )}
                  
                  {user?.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">{user?.location}</span>
                    </div>
                  )}
                  
                  {user?.company_name && (
                    <div className="flex items-center text-sm">
                      <Building className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">{user?.company_name}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-1">
                      <span>Account Status</span>
                      <span className={`font-medium ${
                        user?.is_verified ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {user?.is_verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Member Since</span>
                      <span className="font-medium">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Security Settings */}
          <Card className="mt-6">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <Button variant="secondary" className="w-full">
                  Change Password
                </Button>
                <Button variant="secondary" className="w-full">
                  Two-Factor Authentication
                </Button>
                <Button variant="secondary" className="w-full">
                  Login History
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;



