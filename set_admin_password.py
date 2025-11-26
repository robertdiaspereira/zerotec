from django.contrib.auth import get_user_model

User = get_user_model()

# Get or create admin user
user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@zerotec.com',
        'is_staff': True,
        'is_superuser': True
    }
)

# Set password
user.set_password('admin123')
user.save()

print(f"User '{user.username}' password set successfully!")
print(f"Email: {user.email}")
print(f"Password: admin123")
