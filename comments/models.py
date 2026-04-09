from django.db import models
import uuid
from accounts.models import Account
from posts.models import Post

# Create your models here.
class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(Account, on_delete=models.CASCADE)
    content = models.TextField(null=False, blank=False)
    reply_to = models.ForeignKey('Comment', null=True, blank=True, on_delete=models.CASCADE)
    is_edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
    
    def __str__(self):
        return self.author.username + ' on ' + self.post.title[:20] + '...'