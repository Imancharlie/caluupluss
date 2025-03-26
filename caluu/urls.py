
from django.contrib import admin
from django.urls import path
from caluu_app.api_views import api_login, api_register, check_auth, api_logout

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', api_login, name='api_login'),
    path('api/auth/register/', api_register, name='api_register'),
    path('api/auth/check/', check_auth, name='api_check_auth'),
    path('api/auth/logout/', api_logout, name='api_logout'),
]
