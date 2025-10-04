from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models.functions import Lower
import uuid


class University(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, unique=True, default=uuid.uuid4)
    name = models.CharField(max_length=255, unique=True)
    country = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('University')
        verbose_name_plural = _('Universities')
        indexes = [
            models.Index(Lower('name'), name='university_name_lower_idx'),
        ]

    def save(self, *args, **kwargs):
        # Enforce case-insensitive uniqueness at application level
        if University.objects.exclude(pk=self.pk).filter(name__iexact=self.name).exists():
            raise ValueError('University with this name already exists.')
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class College(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, unique=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='colleges')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('College')
        verbose_name_plural = _('Colleges')
        constraints = [
            models.UniqueConstraint(
                Lower('name'), 'university',
                name='unique_college_name_per_university_ci'
            )
        ]

    def save(self, *args, **kwargs):
        # Enforce case-insensitive uniqueness within a university
        if College.objects.exclude(pk=self.pk).filter(
            university=self.university,
            name__iexact=self.name
        ).exists():
            raise ValueError('College with this name already exists in this university.')
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.name} ({self.university.name})"


