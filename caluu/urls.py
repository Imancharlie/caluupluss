from django.contrib import admin
from django.urls import path
from caluu_app.api_views import api_login, api_register

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', api_login, name='api_login'),
    path('api/auth/register/', api_register, name='api_register'),
] 