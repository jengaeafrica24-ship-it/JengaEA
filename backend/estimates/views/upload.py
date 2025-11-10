from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from ..serializers.upload import EstimateUploadSerializer


class EstimateUploadView(APIView):
    """Handle estimate creation with optional file upload."""
    
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        serializer = EstimateUploadSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            estimate = serializer.save()
            return Response({
                'id': estimate.id,
                'message': 'Estimate created successfully',
                'status': estimate.status
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)