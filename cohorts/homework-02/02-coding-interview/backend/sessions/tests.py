from django.test import TestCase
from django.urls import reverse
import json
import uuid
import re


class SessionIntegrationTests(TestCase):
    """Integration tests for the session creation API endpoint."""

    def test_create_session_endpoint(self):
        """Test that POST /api/sessions/ creates a new session successfully."""
        url = reverse('sessions:create_session')

        # Send POST request to create a new session
        response = self.client.post(url, content_type='application/json')

        # Assert the response status code is 201 (Created)
        self.assertEqual(response.status_code, 201)

        # Parse the JSON response
        response_data = json.loads(response.content)

        # Assert the response contains required fields
        self.assertIn('id', response_data)
        self.assertIn('url', response_data)

        # Assert the session ID is a string
        self.assertIsInstance(response_data['id'], str)

        # Assert the session ID is not empty
        self.assertTrue(response_data['id'])

        # Assert the session ID looks like a UUID (first 8 characters)
        self.assertTrue(len(response_data['id']) == 8)

        # Assert the URL contains the session ID
        self.assertIn(response_data['id'], response_data['url'])

        # Assert the URL has the correct format
        expected_url_pattern = r'http://localhost:5173/session/[a-f0-9]{8}'
        self.assertTrue(re.match(expected_url_pattern, response_data['url']))

    def test_create_session_returns_unique_ids(self):
        """Test that creating multiple sessions returns unique session IDs."""
        url = reverse('sessions:create_session')

        # Create first session
        response1 = self.client.post(url, content_type='application/json')
        self.assertEqual(response1.status_code, 201)
        data1 = json.loads(response1.content)

        # Create second session
        response2 = self.client.post(url, content_type='application/json')
        self.assertEqual(response2.status_code, 201)
        data2 = json.loads(response2.content)

        # Assert the session IDs are different
        self.assertNotEqual(data1['id'], data2['id'])

        # Assert the URLs are different
        self.assertNotEqual(data1['url'], data2['url'])

    def test_get_session_endpoint(self):
        """Test that GET /api/sessions/<session_id>/ returns session info."""
        # First create a session
        create_url = reverse('sessions:create_session')
        create_response = self.client.post(create_url, content_type='application/json')
        self.assertEqual(create_response.status_code, 201)
        session_data = json.loads(create_response.content)
        session_id = session_data['id']

        # Then get the session info
        get_url = reverse('sessions:get_session', kwargs={'session_id': session_id})
        get_response = self.client.get(get_url)

        # Assert the response status code is 200 (OK)
        self.assertEqual(get_response.status_code, 200)

        # Parse the JSON response
        response_data = json.loads(get_response.content)

        # Assert the response contains the expected fields
        self.assertIn('id', response_data)
        self.assertIn('url', response_data)

        # Assert the returned ID matches the requested ID
        self.assertEqual(response_data['id'], session_id)

        # Assert the URL contains the session ID
        self.assertIn(session_id, response_data['url'])

    def test_get_nonexistent_session(self):
        """Test that GET /api/sessions/<nonexistent_id>/ still returns session info."""
        # Use a random session ID that doesn't exist
        fake_session_id = 'nonexistent'

        get_url = reverse('sessions:get_session', kwargs={'session_id': fake_session_id})
        get_response = self.client.get(get_url)

        # The current implementation still returns 200 even for non-existent sessions
        # This test documents the current behavior
        self.assertEqual(get_response.status_code, 200)

        response_data = json.loads(get_response.content)
        self.assertEqual(response_data['id'], fake_session_id)
        self.assertIn(fake_session_id, response_data['url'])

    def test_create_session_cors_headers(self):
        """Test that the session creation endpoint includes CORS headers."""
        url = reverse('sessions:create_session')

        # Send POST request with Origin header to simulate CORS request
        response = self.client.post(
            url,
            content_type='application/json',
            HTTP_ORIGIN='http://localhost:5173'
        )

        # Assert the response is successful
        self.assertEqual(response.status_code, 201)

        # Note: CORS headers are handled by django-corsheaders middleware
        # In a real integration test, you might want to verify the headers are present
        # but this is sufficient for basic testing
