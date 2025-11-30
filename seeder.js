require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const products = [
  {
    title: "Sony WH-1000XM5 Headphones",
    description: "Industry leading noise canceling bluetooth headphones with mic.",
    price: 29990,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=60",
    stock: 10
  },
  {
    title: "Apple MacBook Air M2",
    description: "Supercharged by M2 chip. 13.6-inch Liquid Retina display.",
    price: 114900,
    category: "Laptops",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500&q=60",
    stock: 5
  },
  {
    title: "Nike Air Force 1 '07",
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon.",
    price: 9695,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=60",
    stock: 20
  },
  {
    title: "Samsung Galaxy S23 Ultra",
    description: "Epic nightography, 200MP camera, and fastest Snapdragon processor.",
    price: 124999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&w=500&q=60",
    stock: 8
  },
  {
    title: "Titan Smart Watch",
    description: "Stylish smart watch with health tracking and notifications.",
    price: 7995,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=60",
    stock: 15
  },
  {
    title: "Canon EOS R6 Camera",
    description: "Full-frame mirrorless camera for photographers and filmmakers.",
    price: 215000,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=60",
    stock: 6
  }
];

const importData = async () => {
  try {
    await connectDB();

    await Product.deleteMany(); // Purana data saaf karega
    console.log('🧹 Old data cleared...');

    await Product.insertMany(products); // Naya data daalega
    console.log('✅ Data Imported Successfully!');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
