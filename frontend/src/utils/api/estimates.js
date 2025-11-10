// Material estimation service
export const estimatesAPI = {
  generateMaterialEstimate: async (data) => {
    try {
      const formData = new FormData();
      
      // Handle file upload if present
      if (data.file) {
        formData.append('plan_file', data.file);
      }
      
      // Add other form data
      Object.keys(data).forEach(key => {
        if (key !== 'file' && data[key] !== null && data[key] !== undefined) {
          if (typeof data[key] === 'object') {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      
      const response = await api.post('/api/estimates/materials/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Material estimation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};