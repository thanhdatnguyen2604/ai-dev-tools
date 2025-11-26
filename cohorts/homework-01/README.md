# Django TODO Application

## Project Setup

### 1. Create a new Django project

```bash
django-admin startproject todoproject
cd todoproject
python manage.py startapp todos
```

### 2. Configure settings.py

Add 'todos' to INSTALLED_APPS in `todoproject/settings.py`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'todos',  # Add this line
]
```

## Models

Create the TODO model in `todos/models.py`:

```python
from django.db import models
from django.utils import timezone

class TODO(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
```

## URLs

### Main project URLs (`todoproject/urls.py`):

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('todos.urls')),
]
```

### App URLs (`todos/urls.py` - create this file):

```python
from django.urls import path
from . import views

app_name = 'todos'

urlpatterns = [
    path('', views.todo_list, name='list'),
    path('create/', views.todo_create, name='create'),
    path('<int:pk>/edit/', views.todo_edit, name='edit'),
    path('<int:pk>/delete/', views.todo_delete, name='delete'),
    path('<int:pk>/toggle/', views.todo_toggle, name='toggle'),
]
```

## Forms

Create `todos/forms.py`:

```python
from django import forms
from .models import TODO

class TODOForm(forms.ModelForm):
    class Meta:
        model = TODO
        fields = ['title', 'description', 'due_date']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'due_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }
```

## Views

Create views in `todos/views.py`:

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import TODO
from .forms import TODOForm

def todo_list(request):
    todos = TODO.objects.all()
    return render(request, 'todos/list.html', {'todos': todos})

def todo_create(request):
    if request.method == 'POST':
        form = TODOForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'TODO created successfully!')
            return redirect('todos:list')
    else:
        form = TODOForm()
    return render(request, 'todos/form.html', {'form': form, 'title': 'Create TODO'})

def todo_edit(request, pk):
    todo = get_object_or_404(TODO, pk=pk)
    if request.method == 'POST':
        form = TODOForm(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            messages.success(request, 'TODO updated successfully!')
            return redirect('todos:list')
    else:
        form = TODOForm(instance=todo)
    return render(request, 'todos/form.html', {'form': form, 'title': 'Edit TODO'})

def todo_delete(request, pk):
    todo = get_object_or_404(TODO, pk=pk)
    if request.method == 'POST':
        todo.delete()
        messages.success(request, 'TODO deleted successfully!')
        return redirect('todos:list')
    return render(request, 'todos/confirm_delete.html', {'todo': todo})

def todo_toggle(request, pk):
    todo = get_object_or_404(TODO, pk=pk)
    todo.resolved = not todo.resolved
    todo.save()
    return redirect('todos:list')
```

## Templates

### Base template (`todos/templates/todos/base.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TODO App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .resolved { text-decoration: line-through; opacity: 0.6; }
        .overdue { color: red; }
    </style>
</head>
<body>
    <nav class="navbar navbar-dark bg-primary mb-4">
        <div class="container">
            <a class="navbar-brand" href="{% url 'todos:list' %}">TODO Application</a>
        </div>
    </nav>
    <div class="container">
        {% if messages %}
            {% for message in messages %}
                <div class="alert alert-{{ message.tags }} alert-dismissible fade show" role="alert">
                    {{ message }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            {% endfor %}
        {% endif %}
        {% block content %}{% endblock %}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

### List template (`todos/templates/todos/list.html`):

```html
{% extends 'todos/base.html' %}

{% block content %}
<div class="d-flex justify-content-between align-items-center mb-4">
    <h1>My TODOs</h1>
    <a href="{% url 'todos:create' %}" class="btn btn-primary">+ New TODO</a>
</div>

{% if todos %}
    <div class="list-group">
        {% for todo in todos %}
            <div class="list-group-item {% if todo.resolved %}resolved{% endif %}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ todo.title }}</h5>
                    <div>
                        <a href="{% url 'todos:toggle' todo.pk %}" class="btn btn-sm btn-outline-success">
                            {% if todo.resolved %}Unresolve{% else %}Resolve{% endif %}
                        </a>
                        <a href="{% url 'todos:edit' todo.pk %}" class="btn btn-sm btn-outline-primary">Edit</a>
                        <a href="{% url 'todos:delete' todo.pk %}" class="btn btn-sm btn-outline-danger">Delete</a>
                    </div>
                </div>
                {% if todo.description %}
                    <p class="mb-1">{{ todo.description }}</p>
                {% endif %}
                {% if todo.due_date %}
                    <small class="{% if not todo.resolved and todo.due_date < today %}overdue{% endif %}">
                        Due: {{ todo.due_date }}
                    </small>
                {% endif %}
            </div>
        {% endfor %}
    </div>
{% else %}
    <div class="alert alert-info">No TODOs yet. Create your first one!</div>
{% endif %}
{% endblock %}
```

### Form template (`todos/templates/todos/form.html`):

```html
{% extends 'todos/base.html' %}

{% block content %}
<h1>{{ title }}</h1>
<form method="post" class="mt-4">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit" class="btn btn-primary">Save</button>
    <a href="{% url 'todos:list' %}" class="btn btn-secondary">Cancel</a>
</form>
{% endblock %}
```

### Delete confirmation (`todos/templates/todos/confirm_delete.html`):

```html
{% extends 'todos/base.html' %}

{% block content %}
<h1>Delete TODO</h1>
<div class="alert alert-warning mt-4">
    <p>Are you sure you want to delete "{{ todo.title }}"?</p>
</div>
<form method="post">
    {% csrf_token %}
    <button type="submit" class="btn btn-danger">Yes, Delete</button>
    <a href="{% url 'todos:list' %}" class="btn btn-secondary">Cancel</a>
</form>
{% endblock %}
```

## Admin Registration

Register the model in `todos/admin.py`:

```python
from django.contrib import admin
from .models import TODO

@admin.register(TODO)
class TODOAdmin(admin.ModelAdmin):
    list_display = ['title', 'due_date', 'resolved', 'created_at']
    list_filter = ['resolved', 'due_date']
    search_fields = ['title', 'description']
```

## Test
```python
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
        
```

## Run the Application

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Run all tests
python manage.py test

# Run with verbose output
python manage.py test --verbosity=2

# Run specific test class
python manage.py test todos.tests.TODOModelTest

# Run with coverage (install coverage first: pip install coverage)
coverage run --source='.' manage.py test
coverage report

# Run the development server
python manage.py runserver
```

Visit `http://127.0.0.1:8000/` to use your TODO application!
