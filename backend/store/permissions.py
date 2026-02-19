from rest_framework import permissions

class IsEmployee(permissions.BasePermission):
    """
    Povolí přístup pouze pokud je uživatel Admin (is_staff) 
    NEBO pokud je členem skupiny 'Employee'.
    """
    def has_permission(self, request, view):
        # 1. Uživatel musí být přihlášený
        if not request.user or not request.user.is_authenticated:
            return False
        
        # 2. Musí být Admin NEBO ve skupině Employee
        return request.user.is_staff or request.user.groups.filter(name='Employee').exists()