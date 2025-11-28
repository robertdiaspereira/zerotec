"""
URL patterns for accounts app
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.me_view, name='me'),
    path('me/update/', views.update_profile_view, name='update_profile'),
    path('change-password/', views.change_password_view, name='change_password'),
]

from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'groups', views.GroupViewSet, basename='group')

urlpatterns += router.urls
