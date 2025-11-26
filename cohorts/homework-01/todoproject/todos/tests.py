"""
Tests for the TODO Application
File: todos/tests.py
"""

from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from .models import TODO
from .forms import TODOForm


class TODOModelTest(TestCase):
    """Test cases for the TODO model"""
    
    def setUp(self):
        """Set up test data"""
        self.todo = TODO.objects.create(
            title="Test TODO",
            description="Test description",
            due_date=timezone.now().date() + timedelta(days=7)
        )
    
    def test_todo_creation(self):
        """Test that a TODO can be created"""
        self.assertEqual(self.todo.title, "Test TODO")
        self.assertEqual(self.todo.description, "Test description")
        self.assertFalse(self.todo.resolved)
        self.assertIsNotNone(self.todo.created_at)
    
    def test_todo_str_method(self):
        """Test the string representation of TODO"""
        self.assertEqual(str(self.todo), "Test TODO")
    
    def test_todo_default_resolved_false(self):
        """Test that resolved defaults to False"""
        new_todo = TODO.objects.create(title="Another TODO")
        self.assertFalse(new_todo.resolved)
    
    def test_todo_optional_fields(self):
        """Test that description and due_date are optional"""
        todo = TODO.objects.create(title="Minimal TODO")
        self.assertEqual(todo.description, "")
        self.assertIsNone(todo.due_date)
    
    def test_todo_ordering(self):
        """Test that TODOs are ordered by created_at descending"""
        todo1 = TODO.objects.create(title="First")
        todo2 = TODO.objects.create(title="Second")
        todos = TODO.objects.all()
        self.assertEqual(todos[0], todo2)
        self.assertEqual(todos[1], todo1)


class TODOFormTest(TestCase):
    """Test cases for the TODO form"""
    
    def test_valid_form(self):
        """Test form with valid data"""
        form_data = {
            'title': 'Test TODO',
            'description': 'Test description',
            'due_date': timezone.now().date() + timedelta(days=7)
        }
        form = TODOForm(data=form_data)
        self.assertTrue(form.is_valid())
    
    def test_form_missing_title(self):
        """Test form without required title field"""
        form_data = {
            'description': 'Test description',
        }
        form = TODOForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('title', form.errors)
    
    def test_form_with_only_title(self):
        """Test form with only required field"""
        form_data = {'title': 'Test TODO'}
        form = TODOForm(data=form_data)
        self.assertTrue(form.is_valid())
    
    def test_form_fields(self):
        """Test that form has correct fields"""
        form = TODOForm()
        self.assertIn('title', form.fields)
        self.assertIn('description', form.fields)
        self.assertIn('due_date', form.fields)
        self.assertNotIn('resolved', form.fields)


class TODOViewsTest(TestCase):
    """Test cases for TODO views"""
    
    def setUp(self):
        """Set up test client and test data"""
        self.client = Client()
        self.todo = TODO.objects.create(
            title="Test TODO",
            description="Test description",
            due_date=timezone.now().date() + timedelta(days=7)
        )
    
    def test_todo_list_view(self):
        """Test the TODO list view"""
        response = self.client.get(reverse('todos:list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/list.html')
        self.assertContains(response, "Test TODO")
        self.assertIn('todos', response.context)
    
    def test_todo_list_empty(self):
        """Test list view with no TODOs"""
        TODO.objects.all().delete()
        response = self.client.get(reverse('todos:list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No TODOs yet")
    
    def test_todo_create_view_get(self):
        """Test GET request to create view"""
        response = self.client.get(reverse('todos:create'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/form.html')
        self.assertIsInstance(response.context['form'], TODOForm)
    
    def test_todo_create_view_post_valid(self):
        """Test POST request with valid data"""
        data = {
            'title': 'New TODO',
            'description': 'New description',
            'due_date': timezone.now().date() + timedelta(days=5)
        }
        response = self.client.post(reverse('todos:create'), data)
        self.assertEqual(response.status_code, 302)  # Redirect after success
        self.assertTrue(TODO.objects.filter(title='New TODO').exists())
    
    def test_todo_create_view_post_invalid(self):
        """Test POST request with invalid data"""
        data = {'description': 'Missing title'}
        response = self.client.post(reverse('todos:create'), data)
        self.assertEqual(response.status_code, 200)
        self.assertFormError(response, 'form', 'title', 'This field is required.')
    
    def test_todo_edit_view_get(self):
        """Test GET request to edit view"""
        response = self.client.get(reverse('todos:edit', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/form.html')
        self.assertEqual(response.context['form'].instance, self.todo)
    
    def test_todo_edit_view_post_valid(self):
        """Test POST request to edit with valid data"""
        data = {
            'title': 'Updated TODO',
            'description': 'Updated description',
            'due_date': timezone.now().date() + timedelta(days=10)
        }
        response = self.client.post(reverse('todos:edit', args=[self.todo.pk]), data)
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Updated TODO')
        self.assertEqual(self.todo.description, 'Updated description')
    
    def test_todo_edit_view_404(self):
        """Test edit view with non-existent TODO"""
        response = self.client.get(reverse('todos:edit', args=[9999]))
        self.assertEqual(response.status_code, 404)
    
    def test_todo_delete_view_get(self):
        """Test GET request to delete view (confirmation page)"""
        response = self.client.get(reverse('todos:delete', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/confirm_delete.html')
        self.assertEqual(response.context['todo'], self.todo)
    
    def test_todo_delete_view_post(self):
        """Test POST request to delete view"""
        todo_pk = self.todo.pk
        response = self.client.post(reverse('todos:delete', args=[todo_pk]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(TODO.objects.filter(pk=todo_pk).exists())
    
    def test_todo_toggle_view(self):
        """Test toggling TODO resolved status"""
        self.assertFalse(self.todo.resolved)
        response = self.client.get(reverse('todos:toggle', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.resolved)
        
        # Toggle again
        response = self.client.get(reverse('todos:toggle', args=[self.todo.pk]))
        self.todo.refresh_from_db()
        self.assertFalse(self.todo.resolved)
    
    def test_todo_toggle_view_404(self):
        """Test toggle view with non-existent TODO"""
        response = self.client.get(reverse('todos:toggle', args=[9999]))
        self.assertEqual(response.status_code, 404)


class TODOIntegrationTest(TestCase):
    """Integration tests for TODO workflow"""
    
    def setUp(self):
        self.client = Client()
    
    def test_complete_todo_workflow(self):
        """Test creating, editing, resolving, and deleting a TODO"""
        # Create TODO
        create_data = {
            'title': 'Integration Test TODO',
            'description': 'Testing complete workflow',
            'due_date': timezone.now().date() + timedelta(days=3)
        }
        response = self.client.post(reverse('todos:create'), create_data)
        self.assertEqual(response.status_code, 302)
        
        todo = TODO.objects.get(title='Integration Test TODO')
        self.assertFalse(todo.resolved)
        
        # Edit TODO
        edit_data = {
            'title': 'Updated Integration Test',
            'description': 'Updated description',
            'due_date': timezone.now().date() + timedelta(days=5)
        }
        response = self.client.post(reverse('todos:edit', args=[todo.pk]), edit_data)
        todo.refresh_from_db()
        self.assertEqual(todo.title, 'Updated Integration Test')
        
        # Mark as resolved
        response = self.client.get(reverse('todos:toggle', args=[todo.pk]))
        todo.refresh_from_db()
        self.assertTrue(todo.resolved)
        
        # Delete TODO
        response = self.client.post(reverse('todos:delete', args=[todo.pk]))
        self.assertFalse(TODO.objects.filter(pk=todo.pk).exists())
    
    def test_multiple_todos_display(self):
        """Test that multiple TODOs are displayed correctly"""
        TODO.objects.create(title="TODO 1", resolved=False)
        TODO.objects.create(title="TODO 2", resolved=True)
        TODO.objects.create(title="TODO 3", resolved=False)
        
        response = self.client.get(reverse('todos:list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['todos']), 3)
        self.assertContains(response, "TODO 1")
        self.assertContains(response, "TODO 2")
        self.assertContains(response, "TODO 3")


class TODOURLTest(TestCase):
    """Test URL patterns"""
    
    def test_list_url_resolves(self):
        """Test that list URL resolves correctly"""
        url = reverse('todos:list')
        self.assertEqual(url, '/')
    
    def test_create_url_resolves(self):
        """Test that create URL resolves correctly"""
        url = reverse('todos:create')
        self.assertEqual(url, '/create/')
    
    def test_edit_url_resolves(self):
        """Test that edit URL resolves correctly"""
        url = reverse('todos:edit', args=[1])
        self.assertEqual(url, '/1/edit/')
    
    def test_delete_url_resolves(self):
        """Test that delete URL resolves correctly"""
        url = reverse('todos:delete', args=[1])
        self.assertEqual(url, '/1/delete/')
    
    def test_toggle_url_resolves(self):
        """Test that toggle URL resolves correctly"""
        url = reverse('todos:toggle', args=[1])
        self.assertEqual(url, '/1/toggle/')
        