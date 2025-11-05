from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from .models import ExcelTemplate, GeneratedData
from .serializers import ExcelTemplateSerializer, GeneratedDataSerializer

class ExcelTemplateViewSet(viewsets.ModelViewSet):
    queryset = ExcelTemplate.objects.all()
    serializer_class = ExcelTemplateSerializer
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_data(self, request, pk=None):
        template = self.get_object()
        year = request.data.get('year', timezone.now().year)
        
        try:
            # Read the template
            df = pd.read_excel(template.file.path)
            
            # Generate data for each quarter (4-month periods)
            quarters = ['Q1', 'Q2', 'Q3']
            generated_files = []
            
            for quarter in quarters:
                # Generate data based on the template
                generated_df = self._generate_quarterly_data(df, quarter)
                
                # Save the generated file
                output_path = f'media/generated_data/{template.name}_{year}_{quarter}.xlsx'
                generated_df.to_excel(output_path, index=False)
                
                # Create GeneratedData record
                generated_data = GeneratedData.objects.create(
                    template=template,
                    quota_period=quarter,
                    year=year,
                    generated_file=output_path,
                    created_by=request.user
                )
                
                generated_files.append(GeneratedDataSerializer(generated_data).data)
            
            return Response({
                'message': 'Data generated successfully',
                'files': generated_files
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _generate_quarterly_data(self, template_df, quarter):
        """
        Generate construction data for a specific quarter based on the template.
        Uses historical patterns and seasonal variations.
        """
        # Create a copy of the template
        generated_df = template_df.copy()
        
        # Define seasonal factors for different quarters
        seasonal_factors = {
            'Q1': {'labor': 1.0, 'materials': 1.0, 'equipment': 1.0},  # Base quarter
            'Q2': {'labor': 1.1, 'materials': 1.05, 'equipment': 1.15},  # Peak season
            'Q3': {'labor': 0.95, 'materials': 1.02, 'equipment': 0.9},  # Regular season
            'Q4': {'labor': 0.9, 'materials': 0.98, 'equipment': 0.85}  # Low season
        }
        
        # Get the seasonal factors for the current quarter
        factors = seasonal_factors[quarter]
        
        # Process different types of costs
        for column in generated_df.columns:
            if column.lower().startswith('labor_'):
                generated_df[column] = generated_df[column] * factors['labor'] * np.random.uniform(0.95, 1.05, size=len(generated_df))
            elif column.lower().startswith('material_'):
                generated_df[column] = generated_df[column] * factors['materials'] * np.random.uniform(0.98, 1.02, size=len(generated_df))
            elif column.lower().startswith('equipment_'):
                generated_df[column] = generated_df[column] * factors['equipment'] * np.random.uniform(0.92, 1.08, size=len(generated_df))
        
        # Add metadata
        generated_df['Quarter'] = quarter
        generated_df['Generated_Date'] = timezone.now()
        generated_df['Location_Factor'] = np.random.uniform(0.9, 1.1, size=len(generated_df))  # Location-based variation
        generated_df['Market_Adjustment'] = np.random.uniform(0.95, 1.05, size=len(generated_df))  # Market conditions
        
        # Calculate total costs
        if 'Total_Cost' not in generated_df.columns:
            cost_columns = [col for col in generated_df.columns if any(col.lower().startswith(prefix) for prefix in ['labor_', 'material_', 'equipment_'])]
            generated_df['Total_Cost'] = generated_df[cost_columns].sum(axis=1)
        
        return generated_df

class GeneratedDataViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GeneratedData.objects.all()
    serializer_class = GeneratedDataSerializer

    def get_queryset(self):
        queryset = GeneratedData.objects.all()
        year = self.request.query_params.get('year', None)
        quarter = self.request.query_params.get('quarter', None)
        
        if year:
            queryset = queryset.filter(year=year)
        if quarter:
            queryset = queryset.filter(quota_period=quarter)
            
        return queryset.order_by('-created_at')