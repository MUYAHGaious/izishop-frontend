from src.models.user import db
from datetime import datetime
from sqlalchemy import func

class Shop(db.Model):
    __tablename__ = 'shops'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    description = db.Column(db.Text)
    logo_url = db.Column(db.String(500))
    banner_url = db.Column(db.String(500))
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    country = db.Column(db.String(100), default='Cameroon')
    phone = db.Column(db.String(20))
    email = db.Column(db.String(255))
    website = db.Column(db.String(255))
    is_verified = db.Column(db.Boolean, default=False)
    is_premium = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    rating = db.Column(db.Numeric(3, 2), default=0.00)
    total_reviews = db.Column(db.Integer, default=0)
    total_products = db.Column(db.Integer, default=0)
    total_sales = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    products = db.relationship('Product', backref='shop', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('ShopReview', backref='shop', lazy=True, cascade='all, delete-orphan')
    followers = db.relationship('ShopFollower', backref='shop', lazy=True, cascade='all, delete-orphan')
    
    def generate_slug(self):
        """Generate URL-friendly slug from shop name"""
        import re
        slug = re.sub(r'[^\w\s-]', '', self.name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')
    
    def update_stats(self):
        """Update shop statistics"""
        # Update total products
        self.total_products = Product.query.filter_by(shop_id=self.id, is_active=True).count()
        
        # Update total reviews and rating
        reviews = ShopReview.query.filter_by(shop_id=self.id).all()
        if reviews:
            self.total_reviews = len(reviews)
            self.rating = sum(review.rating for review in reviews) / len(reviews)
        else:
            self.total_reviews = 0
            self.rating = 0.00
    
    def to_dict(self):
        """Convert shop to dictionary"""
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'logo_url': self.logo_url,
            'banner_url': self.banner_url,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'phone': self.phone,
            'email': self.email,
            'website': self.website,
            'is_verified': self.is_verified,
            'is_premium': self.is_premium,
            'is_active': self.is_active,
            'rating': float(self.rating) if self.rating else 0.0,
            'total_reviews': self.total_reviews,
            'total_products': self.total_products,
            'total_sales': self.total_sales,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'owner': self.owner.to_dict() if self.owner else None
        }
    
    def __repr__(self):
        return f'<Shop {self.name}>'


class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    original_price = db.Column(db.Numeric(10, 2))
    stock_quantity = db.Column(db.Integer, default=0)
    category = db.Column(db.String(100))
    subcategory = db.Column(db.String(100))
    brand = db.Column(db.String(100))
    sku = db.Column(db.String(100))
    weight = db.Column(db.Numeric(8, 2))
    dimensions = db.Column(db.String(100))
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    rating = db.Column(db.Numeric(3, 2), default=0.00)
    total_reviews = db.Column(db.Integer, default=0)
    total_sales = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    images = db.relationship('ProductImage', backref='product', lazy=True, cascade='all, delete-orphan')
    
    # Unique constraint for shop_id and slug combination
    __table_args__ = (db.UniqueConstraint('shop_id', 'slug', name='unique_shop_slug'),)
    
    def generate_slug(self):
        """Generate URL-friendly slug from product name"""
        import re
        slug = re.sub(r'[^\w\s-]', '', self.name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')
    
    def to_dict(self):
        """Convert product to dictionary"""
        return {
            'id': self.id,
            'shop_id': self.shop_id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'price': float(self.price) if self.price else 0.0,
            'original_price': float(self.original_price) if self.original_price else None,
            'stock_quantity': self.stock_quantity,
            'category': self.category,
            'subcategory': self.subcategory,
            'brand': self.brand,
            'sku': self.sku,
            'weight': float(self.weight) if self.weight else None,
            'dimensions': self.dimensions,
            'is_featured': self.is_featured,
            'is_active': self.is_active,
            'rating': float(self.rating) if self.rating else 0.0,
            'total_reviews': self.total_reviews,
            'total_sales': self.total_sales,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'images': [img.to_dict() for img in self.images] if self.images else []
        }
    
    def __repr__(self):
        return f'<Product {self.name}>'


class ProductImage(db.Model):
    __tablename__ = 'product_images'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    alt_text = db.Column(db.String(255))
    is_primary = db.Column(db.Boolean, default=False)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert product image to dictionary"""
        return {
            'id': self.id,
            'product_id': self.product_id,
            'image_url': self.image_url,
            'alt_text': self.alt_text,
            'is_primary': self.is_primary,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<ProductImage {self.id}>'


class ShopReview(db.Model):
    __tablename__ = 'shop_reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255))
    comment = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)
    helpful_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint for customer, shop, and product combination
    __table_args__ = (db.UniqueConstraint('customer_id', 'shop_id', 'product_id', name='unique_customer_shop_review'),)
    
    def to_dict(self):
        """Convert shop review to dictionary"""
        return {
            'id': self.id,
            'shop_id': self.shop_id,
            'customer_id': self.customer_id,
            'product_id': self.product_id,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'is_verified': self.is_verified,
            'helpful_count': self.helpful_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'customer': self.customer.to_dict() if self.customer else None,
            'product': self.product.to_dict() if self.product else None
        }
    
    def __repr__(self):
        return f'<ShopReview {self.id}>'


class ShopFollower(db.Model):
    __tablename__ = 'shop_followers'
    
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint for shop and user combination
    __table_args__ = (db.UniqueConstraint('shop_id', 'user_id', name='unique_shop_follower'),)
    
    def to_dict(self):
        """Convert shop follower to dictionary"""
        return {
            'id': self.id,
            'shop_id': self.shop_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': self.user.to_dict() if self.user else None
        }
    
    def __repr__(self):
        return f'<ShopFollower {self.id}>'

