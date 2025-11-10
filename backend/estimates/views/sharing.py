from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_material_estimate(request):
    """
    Share a material estimate via email
    """
    try:
        data = request.data
        email = data.get('email')
        estimate = data.get('estimate')
        
        if not email or not estimate:
            return Response({
                'success': False,
                'error': 'Email and estimate data are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Format the estimate data
        project_info = estimate.get('projectInfo', {})
        materials = estimate.get('materials', [])
        costs = {
            'subtotal': estimate.get('subtotal', 0),
            'vat': estimate.get('vat', 0),
            'total': estimate.get('totalCost', 0)
        }
        recommendations = estimate.get('recommendations', [])
        
        # Create email content
        context = {
            'user': request.user,
            'project_info': project_info,
            'materials': materials,
            'costs': costs,
            'recommendations': recommendations
        }
        
        # Render email template
        email_html = render_to_string('estimates/email/material_estimate.html', context)
        email_text = render_to_string('estimates/email/material_estimate.txt', context)
        
        # Send email
        send_mail(
            subject='Your Material Cost Estimate from JengAEA',
            message=email_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=email_html
        )
        
        return Response({
            'success': True,
            'message': f'Estimate shared successfully with {email}'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)