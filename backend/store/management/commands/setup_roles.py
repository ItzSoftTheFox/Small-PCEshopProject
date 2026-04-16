from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

class Command(BaseCommand):
    help = 'Nastaví Groups (Manager, Zamestnanec, Skladnik, Finance) a jejich práva'

    def handle(self, *args, **kwargs):
        roles = {
            'Manager': [
                'add_product', 'change_product', 'delete_product', 'view_product',
                'add_category', 'change_category', 'delete_category', 'view_category',
                'change_order', 'view_order', 'delete_order',
                'view_userprofile', 'change_userprofile',
            ],
            'Zamestnanec': [ # Zákaznická podpora / Správce obsahu
                'add_product', 'change_product', 'view_product',
                'add_category', 'change_category', 'view_category',
                'view_order', # Vidí objednávku, aby mohl poradit na telefonu
                'view_userprofile',
            ],
            'Skladnik': [
                'view_product', 'view_category',
                'view_order', 'change_order', 
            ],
            'Finance': [
                'view_order', 'change_order', 
                'view_userprofile',           
                'view_orderitem',             
            ]
        }

        for group_name, permissions in roles.items():
            group, created = Group.objects.get_or_create(name=group_name)
            group.permissions.clear()

            for codename in permissions:
                try:
                    permission = Permission.objects.get(codename=codename)
                    group.permissions.add(permission)
                except Permission.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f'Chyba: Právo "{codename}" neexistuje.'))

            status = "vytvořena" if created else "aktualizována"
            self.stdout.write(self.style.SUCCESS(f'Skupina "{group_name}" {status}.'))

        self.stdout.write(self.style.SUCCESS('\nHotovo! Všechny 4 role jsou připravené.'))