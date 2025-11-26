from django.contrib import admin
from .models import TODO

@admin.register(TODO)
class TODOAdmin(admin.ModelAdmin):
    list_display = ['title', 'due_date', 'resolved', 'created_at']
    list_filter = ['resolved', 'due_date']
    search_fields = ['title', 'description']
