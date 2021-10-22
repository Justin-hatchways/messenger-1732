from django.db import models
from django.db.models import Q

from . import utils
from .user import User


class Conversation(utils.CustomModel):
    name = models.TextField(null=True)
    users = models.ManyToManyField(
        User, db_column="user", related_name="conversations"
    )

    createdAt = models.DateTimeField(auto_now_add=True, db_index=True)
    updatedAt = models.DateTimeField(auto_now=True)
