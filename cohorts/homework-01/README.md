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

## Run the Application

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Run the development server
python manage.py runserver
```

Visit `http://127.0.0.1:8000/` to use your TODO application!

## Features Implemented

✅ Create TODOs with title, description, and due date
✅ Edit existing TODOs
✅ Delete TODOs with confirmation
✅ Mark TODOs as resolved/unresolved
✅ Display overdue TODOs in red
✅ Strike-through completed TODOs
✅ Bootstrap styling for a clean interface