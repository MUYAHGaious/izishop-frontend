from functools import wraps
from flask import session, jsonify
from src.models.user import User, UserRole

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        return f(user, *args, **kwargs)
    return decorated_function

def require_role(required_role):
    """Decorator to require specific user role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = session.get('user_id')
            if not user_id:
                return jsonify({'error': 'Authentication required'}), 401
            
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 404
            
            if user.role != required_role:
                return jsonify({'error': f'{required_role.value} access required'}), 403
            
            return f(user, *args, **kwargs)
        return decorated_function
    return decorator

def require_shop_owner(f):
    """Decorator to require shop owner role"""
    return require_role(UserRole.SHOP_OWNER)(f)

def require_admin(f):
    """Decorator to require admin role"""
    return require_role(UserRole.ADMIN)(f)

def require_shop_ownership(f):
    """Decorator to require ownership of a specific shop"""
    @wraps(f)
    def decorated_function(shop_id, *args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        if user.role != UserRole.SHOP_OWNER:
            return jsonify({'error': 'Shop owner access required'}), 403
        
        from src.models.shop import Shop
        shop = Shop.query.get(shop_id)
        if not shop:
            return jsonify({'error': 'Shop not found'}), 404
        
        if shop.owner_id != user.id:
            return jsonify({'error': 'Access denied: You do not own this shop'}), 403
        
        return f(user, shop, *args, **kwargs)
    return decorated_function

def optional_auth(f):
    """Decorator for optional authentication (user can be None)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = None
        user_id = session.get('user_id')
        
        if user_id:
            user = User.query.get(user_id)
            if user and not user.is_active:
                user = None
        
        return f(user, *args, **kwargs)
    return decorated_function

