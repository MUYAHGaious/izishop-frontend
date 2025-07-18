from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, UserRole
from src.models.shop import Shop
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Validate role
        try:
            role = UserRole(data['role'])
        except ValueError:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Create new user
        user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone'),
            role=role,
            avatar_url=data.get('avatar_url')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create shop if user is shop owner
        shop_data = None
        if role == UserRole.SHOP_OWNER and data.get('shop'):
            shop_info = data['shop']
            
            # Validate shop name
            if not shop_info.get('name'):
                return jsonify({'error': 'Shop name is required for shop owners'}), 400
            
            # Generate unique slug
            base_slug = Shop().generate_slug()
            base_slug = re.sub(r'[^\w\s-]', '', shop_info['name'].lower())
            base_slug = re.sub(r'[-\s]+', '-', base_slug).strip('-')
            
            slug = base_slug
            counter = 1
            while Shop.query.filter_by(slug=slug).first():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Create shop
            shop = Shop(
                owner_id=user.id,
                name=shop_info['name'],
                slug=slug,
                description=shop_info.get('description'),
                address=shop_info.get('address'),
                city=shop_info.get('city'),
                phone=shop_info.get('phone'),
                email=shop_info.get('email')
            )
            
            db.session.add(shop)
            db.session.commit()
            shop_data = shop.to_dict()
        
        # Create session
        session['user_id'] = user.id
        session['user_role'] = user.role.value
        
        response_data = {
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'shop': shop_data
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Create session
        session['user_id'] = user.id
        session['user_role'] = user.role.value
        
        # Get user's shops if shop owner
        shops = []
        if user.role == UserRole.SHOP_OWNER:
            shops = [shop.to_dict() for shop in user.shops if shop.is_active]
        
        response_data = {
            'message': 'Login successful',
            'user': user.to_dict(),
            'shops': shops
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user profile"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's shops if shop owner
        shops = []
        if user.role == UserRole.SHOP_OWNER:
            shops = [shop.to_dict() for shop in user.shops if shop.is_active]
        
        response_data = {
            'user': user.to_dict(),
            'shops': shops
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/update-profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        
        # Update password if provided
        if 'password' in data:
            is_valid, message = validate_password(data['password'])
            if not is_valid:
                return jsonify({'error': message}), 400
            user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

