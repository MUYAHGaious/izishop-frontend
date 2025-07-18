from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, UserRole
from src.models.shop import Shop, Product, ProductImage, ShopReview, ShopFollower
from sqlalchemy import or_, and_
import re

shop_bp = Blueprint('shop', __name__)

def require_auth():
    """Check if user is authenticated"""
    user_id = session.get('user_id')
    if not user_id:
        return None, jsonify({'error': 'Authentication required'}), 401
    
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return None, jsonify({'error': 'User not found or inactive'}), 404
    
    return user, None, None

def require_shop_owner(shop_id=None):
    """Check if user is shop owner and optionally owns specific shop"""
    user, error_response, status_code = require_auth()
    if error_response:
        return None, None, error_response, status_code
    
    if user.role != UserRole.SHOP_OWNER:
        return None, None, jsonify({'error': 'Shop owner access required'}), 403
    
    shop = None
    if shop_id:
        shop = Shop.query.get(shop_id)
        if not shop:
            return None, None, jsonify({'error': 'Shop not found'}), 404
        
        if shop.owner_id != user.id:
            return None, None, jsonify({'error': 'Access denied: You do not own this shop'}), 403
    
    return user, shop, None, None

@shop_bp.route('/shops', methods=['GET'])
def get_shops():
    """Get all active shops with optional filtering"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '').strip()
        city = request.args.get('city', '').strip()
        is_verified = request.args.get('is_verified')
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Build query
        query = Shop.query.filter_by(is_active=True)
        
        # Apply filters
        if search:
            query = query.filter(or_(
                Shop.name.ilike(f'%{search}%'),
                Shop.description.ilike(f'%{search}%')
            ))
        
        if city:
            query = query.filter(Shop.city.ilike(f'%{city}%'))
        
        if is_verified is not None:
            is_verified_bool = is_verified.lower() == 'true'
            query = query.filter(Shop.is_verified == is_verified_bool)
        
        # Apply sorting
        if sort_by == 'name':
            order_column = Shop.name
        elif sort_by == 'rating':
            order_column = Shop.rating
        elif sort_by == 'total_reviews':
            order_column = Shop.total_reviews
        else:
            order_column = Shop.created_at
        
        if sort_order == 'asc':
            query = query.order_by(order_column.asc())
        else:
            query = query.order_by(order_column.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        shops = [shop.to_dict() for shop in pagination.items]
        
        return jsonify({
            'shops': shops,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shop_bp.route('/shops/<int:shop_id>', methods=['GET'])
def get_shop(shop_id):
    """Get shop details"""
    try:
        shop = Shop.query.get(shop_id)
        if not shop or not shop.is_active:
            return jsonify({'error': 'Shop not found'}), 404
        
        # Update shop stats
        shop.update_stats()
        db.session.commit()
        
        return jsonify({'shop': shop.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shop_bp.route('/shops', methods=['POST'])
def create_shop():
    """Create a new shop (shop owners only)"""
    try:
        user, _, error_response, status_code = require_shop_owner()
        if error_response:
            return error_response, status_code
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Shop name is required'}), 400
        
        # Generate unique slug
        base_slug = re.sub(r'[^\w\s-]', '', data['name'].lower())
        base_slug = re.sub(r'[-\s]+', '-', base_slug).strip('-')
        
        slug = base_slug
        counter = 1
        while Shop.query.filter_by(slug=slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Create shop
        shop = Shop(
            owner_id=user.id,
            name=data['name'],
            slug=slug,
            description=data.get('description'),
            logo_url=data.get('logo_url'),
            banner_url=data.get('banner_url'),
            address=data.get('address'),
            city=data.get('city'),
            country=data.get('country', 'Cameroon'),
            phone=data.get('phone'),
            email=data.get('email'),
            website=data.get('website')
        )
        
        db.session.add(shop)
        db.session.commit()
        
        return jsonify({
            'message': 'Shop created successfully',
            'shop': shop.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@shop_bp.route('/shops/<int:shop_id>', methods=['PUT'])
def update_shop(shop_id):
    """Update shop details (owner only)"""
    try:
        user, shop, error_response, status_code = require_shop_owner(shop_id)
        if error_response:
            return error_response, status_code
        
        data = request.get_json()
        
        # Update allowed fields
        if 'name' in data:
            shop.name = data['name']
            # Regenerate slug if name changed
            base_slug = re.sub(r'[^\w\s-]', '', data['name'].lower())
            base_slug = re.sub(r'[-\s]+', '-', base_slug).strip('-')
            
            slug = base_slug
            counter = 1
            while Shop.query.filter(and_(Shop.slug == slug, Shop.id != shop_id)).first():
                slug = f"{base_slug}-{counter}"
                counter += 1
            shop.slug = slug
        
        if 'description' in data:
            shop.description = data['description']
        if 'logo_url' in data:
            shop.logo_url = data['logo_url']
        if 'banner_url' in data:
            shop.banner_url = data['banner_url']
        if 'address' in data:
            shop.address = data['address']
        if 'city' in data:
            shop.city = data['city']
        if 'country' in data:
            shop.country = data['country']
        if 'phone' in data:
            shop.phone = data['phone']
        if 'email' in data:
            shop.email = data['email']
        if 'website' in data:
            shop.website = data['website']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Shop updated successfully',
            'shop': shop.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@shop_bp.route('/shops/<int:shop_id>', methods=['DELETE'])
def delete_shop(shop_id):
    """Delete shop (owner only)"""
    try:
        user, shop, error_response, status_code = require_shop_owner(shop_id)
        if error_response:
            return error_response, status_code
        
        # Soft delete by setting is_active to False
        shop.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Shop deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@shop_bp.route('/my-shops', methods=['GET'])
def get_my_shops():
    """Get current user's shops"""
    try:
        user, error_response, status_code = require_auth()
        if error_response:
            return error_response, status_code
        
        if user.role != UserRole.SHOP_OWNER:
            return jsonify({'shops': []}), 200
        
        shops = [shop.to_dict() for shop in user.shops if shop.is_active]
        
        return jsonify({'shops': shops}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shop_bp.route('/shops/<int:shop_id>/products', methods=['GET'])
def get_shop_products(shop_id):
    """Get products for a specific shop"""
    try:
        shop = Shop.query.get(shop_id)
        if not shop or not shop.is_active:
            return jsonify({'error': 'Shop not found'}), 404
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Build query
        query = Product.query.filter_by(shop_id=shop_id, is_active=True)
        
        # Apply filters
        if search:
            query = query.filter(or_(
                Product.name.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%')
            ))
        
        if category:
            query = query.filter(Product.category.ilike(f'%{category}%'))
        
        # Apply sorting
        if sort_by == 'name':
            order_column = Product.name
        elif sort_by == 'price':
            order_column = Product.price
        elif sort_by == 'rating':
            order_column = Product.rating
        else:
            order_column = Product.created_at
        
        if sort_order == 'asc':
            query = query.order_by(order_column.asc())
        else:
            query = query.order_by(order_column.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        products = [product.to_dict() for product in pagination.items]
        
        return jsonify({
            'products': products,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shop_bp.route('/shops/<int:shop_id>/follow', methods=['POST'])
def follow_shop(shop_id):
    """Follow/unfollow a shop"""
    try:
        user, error_response, status_code = require_auth()
        if error_response:
            return error_response, status_code
        
        shop = Shop.query.get(shop_id)
        if not shop or not shop.is_active:
            return jsonify({'error': 'Shop not found'}), 404
        
        # Check if already following
        existing_follow = ShopFollower.query.filter_by(
            shop_id=shop_id, 
            user_id=user.id
        ).first()
        
        if existing_follow:
            # Unfollow
            db.session.delete(existing_follow)
            message = 'Shop unfollowed successfully'
            is_following = False
        else:
            # Follow
            follow = ShopFollower(shop_id=shop_id, user_id=user.id)
            db.session.add(follow)
            message = 'Shop followed successfully'
            is_following = True
        
        db.session.commit()
        
        return jsonify({
            'message': message,
            'is_following': is_following
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@shop_bp.route('/shops/<int:shop_id>/reviews', methods=['GET'])
def get_shop_reviews(shop_id):
    """Get reviews for a specific shop"""
    try:
        shop = Shop.query.get(shop_id)
        if not shop or not shop.is_active:
            return jsonify({'error': 'Shop not found'}), 404
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        rating_filter = request.args.get('rating', type=int)
        
        # Build query
        query = ShopReview.query.filter_by(shop_id=shop_id)
        
        if rating_filter:
            query = query.filter(ShopReview.rating == rating_filter)
        
        # Order by creation date (newest first)
        query = query.order_by(ShopReview.created_at.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        reviews = [review.to_dict() for review in pagination.items]
        
        return jsonify({
            'reviews': reviews,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

