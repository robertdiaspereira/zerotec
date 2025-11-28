from django.contrib.auth.models import Group

groups = ['Administrador', 'Técnico', 'Vendedor']
for name in groups:
    group, created = Group.objects.get_or_create(name=name)
    if created:
        print(f"Created group: {name}")
    else:
        print(f"Group exists: {name}")
