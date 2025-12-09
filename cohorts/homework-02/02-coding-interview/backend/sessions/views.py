from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import uuid

@csrf_exempt
@require_http_methods(["POST"])
def create_session(request):
    """
    Create a new coding session and return session ID and URL
    """
    try:
        # Generate a unique session ID
        session_id = str(uuid.uuid4())[:8]  # Short UUID for cleaner URLs

        # Create response with session ID and URL
        response_data = {
            'id': session_id,
            'url': f'http://localhost:5173/session/{session_id}'
        }

        return JsonResponse(response_data, status=201)

    except Exception as e:
        return JsonResponse(
            {'error': 'Failed to create session'},
            status=500
        )

@require_http_methods(["GET"])
def get_session(request, session_id):
    """
    Get session information
    """
    try:
        # For now, just return session info (could be extended)
        response_data = {
            'id': session_id,
            'url': f'http://localhost:5173/session/{session_id}'
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse(
            {'error': 'Session not found'},
            status=404
        )
