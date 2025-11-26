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
