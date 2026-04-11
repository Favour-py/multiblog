from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
import os

schema_view = get_schema_view(
    openapi.Info(
        title="MultiBlog API",
        default_version='v1',
        description="A multi-user blogging platform API",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

def serve_frontend(filename):
    def view(request, **kwargs):
        # Try multiple possible paths
        possible_paths = [
            os.path.join(settings.BASE_DIR, 'frontend', filename),
            os.path.join(os.path.dirname(settings.BASE_DIR), 'frontend', filename),
            os.path.join('/opt/render/project/src', 'frontend', filename),
        ]
        for filepath in possible_paths:
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    return HttpResponse(f.read(), content_type='text/html')
        return HttpResponse(f'File not found. BASE_DIR={settings.BASE_DIR}', status=404)
    return view

urlpatterns = [
    path('admin/', admin.site.urls),

    # Frontend pages
    path('', serve_frontend('index.html'), name='index'),
    path('signup/', serve_frontend('signup.html'), name='signup'),
    path('signin/', serve_frontend('signin.html'), name='signin'),
    path('home/', serve_frontend('home.html'), name='home'),
    path('profile/', serve_frontend('profile.html'), name='profile'),
    path('messages/', serve_frontend('message.html'), name='messages'),
    path('chats/', serve_frontend('chats.html'), name='chats'),
    path('comments/', serve_frontend('comments.html'), name='comments'),
    path('edit-profile/', serve_frontend('edit_profile.html'), name='edit-profile'),

    # API
    path('api/auth/', include('accounts.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('api/posts/', include('posts.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/chat/', include('chat.urls')),

    # Swagger UI
    re_path(r'swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    re_path(r'^(?P<path>.+\.(css|js|svg|png|jpg|jpeg|ttf|ico|txt))$',
            serve, {'document_root': settings.BASE_DIR / 'frontend'}),
]
