from django.urls import path
from . import views

app_name = 'sessions'

urlpatterns = [
    path('sessions/', views.create_session, name='create_session'),
    path('sessions/<str:session_id>/', views.get_session, name='get_session'),
]