"""
Base models for all apps
"""

from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    """
    Abstract base class with created_at and updated_at fields
    """
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        abstract = True


class ActiveModel(models.Model):
    """
    Abstract base class with active field
    """
    active = models.BooleanField('Ativo', default=True)

    class Meta:
        abstract = True


class BaseModel(TimeStampedModel, ActiveModel):
    """
    Complete base model with timestamps and active field
    """
    class Meta:
        abstract = True
