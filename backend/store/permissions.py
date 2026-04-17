from rest_framework import permissions

class IsStaffMember(permissions.BasePermission):
    """
    Pustí dovnitř kohokoliv ze zaměstnanců e-shopu 
    (ideální pro výpis všech objednávek).
    """
    def has_permission(self, request, view):
        # 1. Je vůbec přihlášený?
        if not request.user or not request.user.is_authenticated:
            return False
        
        # 2. Ty jako superuser projdeš vždycky automaticky
        if request.user.is_superuser:
            return True
            
        # 3. Kontrola přesně podle tvých českých skupin v DB
        allowed_groups = ['Manager', 'Zamestnanec', 'Skladnik', 'Finance']
        return request.user.groups.filter(name__in=allowed_groups).exists()

class IsManager(permissions.BasePermission):
    """
    Přísnější vyhazovač - pustí jen Manažera nebo Tebe.
    (ideální pro mazání produktů z katalogu).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.is_superuser:
            return True
            
        return request.user.groups.filter(name='Manager').exists()