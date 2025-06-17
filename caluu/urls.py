from django.contrib import admin
from django.urls import path
from caluu_app.api_views import (
    api_login, 
    api_register, 
    check_auth, 
    api_logout,
    send_email_to_users,
    get_admin_dashboard_data,
    get_user_count
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', api_login, name='api_login'),
    path('api/auth/register/', api_register, name='api_register'),
    path('api/auth/check/', check_auth, name='api_check_auth'),
    path('api/auth/logout/', api_logout, name='api_logout'),
    path('api/admin/send-email/', send_email_to_users, name='send_email_to_users'),
    path('api/admin/dashboard/', get_admin_dashboard_data, name='admin_dashboard'),
    path('api/admin/user-count/', get_user_count, name='user_count'),
]
