from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from comments.models import Post, Comment

class MinimalCommentTests(APITestCase):
    def setUp(self):
        # Create users
        self.user = User.objects.create_user(username="user", password="pass123")
        self.other_user = User.objects.create_user(username="other", password="pass123")

        # Create a post
        self.post = Post.objects.create(title="Test Post", content="Post content")

    def test_authenticated_user_can_create_comment(self):
        self.client.login(username="user", password="pass123")
        url = "/comments/"
        data = {"post": str(self.post.id), "content": "First comment"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_anonymous_user_cannot_create_comment(self):
        url = "/comments/"
        data = {"post": str(self.post.id), "content": "Anonymous comment"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reply_must_belong_to_same_post(self):
        # Create another post and a parent comment on it
        other_post = Post.objects.create(title="Other Post", content="Other content")
        parent_comment = Comment.objects.create(post=other_post, author=self.user, content="Parent")

        self.client.login(username="user", password="pass123")
        url = "/comments/"
        data = {
            "post": str(self.post.id),
            "content": "Invalid reply",
            "reply_to": str(parent_comment.id)
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
