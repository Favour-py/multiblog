"""
URL configuration for multiblog_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="MultiBlog API",
        default_version='v1',
        description="A multi-user blogging platform API",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)
swagger_settings = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
        }
    }
}

urlpatterns = [
    path('admin/', admin.site.urls),

    # Frontend pages
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
    path('signup/', TemplateView.as_view(template_name='signup.html'), name='signup'),
    path('signin/', TemplateView.as_view(template_name='signin.html'), name='signin'),
    path('home/', TemplateView.as_view(template_name='home.html'), name='home'),
    path('profile/', TemplateView.as_view(template_name='profile.html'), name='profile'),
    path('messages/', TemplateView.as_view(template_name='message.html'), name='messages'),
    path('chats/', TemplateView.as_view(template_name='chats.html'), name='chats'),
    path('comments/', TemplateView.as_view(template_name='comments.html'), name='comments'),

    # API
    path('api/auth/', include('accounts.urls')),
    path('api/auth/token/refresh/', __import__('rest_framework_simplejwt.views', fromlist=['TokenRefreshView']).TokenRefreshView.as_view(), name='token-refresh'),
    path('api/posts/', include('posts.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/chat/', include('chat.urls')),
    
    # Swagger UI
    re_path(r'swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    # Serve all frontend static assets (css, js, svg, png, ttf...)
    re_path(r'^(?P<path>.+\.(css|js|svg|png|jpg|jpeg|ttf|ico|txt))$',
            serve, {'document_root': settings.BASE_DIR / 'frontend'}),
]




