db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'readWrite',
      db: 'userdb'
    },
    {
      role: 'readWrite',
      db: 'orderdb'
    },
    {
      role: 'readWrite',
      db: 'productdb'
    },
    {
      role: 'readWrite',
      db: 'analytics'
    }
  ]
});

// Create databases and collections
db = db.getSiblingDB('userdb');
db.createCollection('users');

db = db.getSiblingDB('orderdb');
db.createCollection('orders');

db = db.getSiblingDB('productdb');
db.createCollection('products');
db.createCollection('categories');

db = db.getSiblingDB('analytics');
db.createCollection('events');
db.createCollection('sessions');