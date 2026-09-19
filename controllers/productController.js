const mongoose = require('mongoose');
const Product = require('../models/Product');

const FALLBACK_PRODUCTS = [
    {
        _id: '66e100000000000000000001',
        title: 'Wireless Noise-Canceling Headphones',
        description: 'Premium acoustic clarity with active noise cancellation and 40-hour battery life.',
        price: 14999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
        stock: 25,
        rating: 4.8,
        numReviews: 128,
        featured: true,
        createdAt: new Date('2025-01-01')
    },
    {
        _id: '66e100000000000000000002',
        title: 'Minimalist Chronograph Watch',
        description: 'Precision quartz movement with sapphire glass and genuine leather strap.',
        price: 5999,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
        stock: 14,
        rating: 4.6,
        numReviews: 89,
        featured: true,
        createdAt: new Date('2025-01-02')
    },
    {
        _id: '66e100000000000000000003',
        title: 'Performance Running Sneakers',
        description: 'Ultra-lightweight responsive cushioning for high-end athletic performance.',
        price: 4499,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
        stock: 30,
        rating: 4.9,
        numReviews: 215,
        featured: true,
        createdAt: new Date('2025-01-03')
    },
    {
        _id: '66e100000000000000000004',
        title: '4K Ultra-HD Mirrorless Camera',
        description: 'Professional grade imaging sensor with 4K 60fps video capture and optical stabilization.',
        price: 45000,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=80',
        stock: 8,
        rating: 4.7,
        numReviews: 64,
        featured: true,
        createdAt: new Date('2025-01-04')
    },
    {
        _id: '66e100000000000000000005',
        title: 'Nordic Glass Table Lamp',
        description: 'Warm ambient illumination with frosted glass diffuser and solid brass accents.',
        price: 3299,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80',
        stock: 18,
        rating: 4.5,
        numReviews: 42,
        featured: false,
        createdAt: new Date('2025-01-05')
    },
    {
        _id: '66e100000000000000000006',
        title: 'Smart Fitness Tracker Band',
        description: 'All-day biometric tracking, heart rate monitoring, and IP68 waterproof rating.',
        price: 2499,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=500&q=80',
        stock: 45,
        rating: 4.4,
        numReviews: 95,
        featured: false,
        createdAt: new Date('2025-01-06')
    }
];

// Helper to filter fallback list
const filterFallback = (query) => {
    const { category, search, keyword, q, minPrice, maxPrice, sort, featured } = query;
    let list = [...FALLBACK_PRODUCTS];

    if (category && category !== 'All' && category !== 'all') {
        list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    const searchTerm = search || keyword || q;
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower));
    }

    if (minPrice !== undefined && minPrice !== '') {
        list = list.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
        list = list.filter(p => p.price <= Number(maxPrice));
    }

    if (featured !== undefined) {
        const isFeatured = featured === 'true' || featured === true;
        list = list.filter(p => p.featured === isFeatured);
    }

    if (sort === 'price-asc' || sort === 'lowest') {
        list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc' || sort === 'highest') {
        list.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'oldest') {
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
};

// Helper to safely escape user input for RegExp patterns
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all products with search, filter, and sort
// @route   GET /products or GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    // If DB is offline, return fallback list instantly without waiting for buffering timeout
    if (mongoose.connection.readyState !== 1) {
        return res.json(filterFallback(req.query));
    }

    try {
        const { category, search, keyword, q, minPrice, maxPrice, sort, featured } = req.query;
        const filter = {};

        // Filter by category with escaped regex
        if (category && category !== 'All' && category !== 'all') {
            filter.category = { $regex: new RegExp(`^${escapeRegex(category)}$`, 'i') };
        }

        // Search in title and description with escaped regex
        const searchTerm = search || keyword || q;
        if (searchTerm) {
            const safeSearch = escapeRegex(searchTerm);
            filter.$or = [
                { title: { $regex: safeSearch, $options: 'i' } },
                { description: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        // Filter by price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined && minPrice !== '') {
                filter.price.$gte = Number(minPrice);
            }
            if (maxPrice !== undefined && maxPrice !== '') {
                filter.price.$lte = Number(maxPrice);
            }
        }

        // Filter by featured status
        if (featured !== undefined) {
            filter.featured = featured === 'true' || featured === true;
        }

        let query = Product.find(filter);

        // Sorting
        if (sort === 'price-asc' || sort === 'lowest') {
            query = query.sort({ price: 1 });
        } else if (sort === 'price-desc' || sort === 'highest') {
            query = query.sort({ price: -1 });
        } else if (sort === 'rating') {
            query = query.sort({ rating: -1 });
        } else if (sort === 'oldest') {
            query = query.sort({ createdAt: 1 });
        } else {
            query = query.sort({ createdAt: -1 });
        }

        const products = await query.exec();

        // Only provide fallback products if the entire database collection has 0 products
        const totalCatalogCount = await Product.estimatedDocumentCount();
        if (totalCatalogCount === 0) {
            return res.json(filterFallback(req.query));
        }

        return res.json(products);
    } catch (error) {
        console.warn("DB Query Error, checking connection state:", error.message);
        if (mongoose.connection.readyState !== 1) {
            return res.json(filterFallback(req.query));
        }
        return res.status(500).json({ message: 'Server Error retrieving products' });
    }
};

// @desc    Get single product
// @route   GET /products/:id or GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        const product = FALLBACK_PRODUCTS.find(p => p._id === req.params.id);
        if (product) return res.json(product);
        return res.status(404).json({ message: 'Product not found' });
    }

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            return res.json(product);
        }

        // Only fallback if the catalog itself is completely empty
        const totalCatalogCount = await Product.estimatedDocumentCount();
        if (totalCatalogCount === 0) {
            const fallback = FALLBACK_PRODUCTS.find(p => p._id === req.params.id);
            if (fallback) return res.json(fallback);
        }

        return res.status(404).json({ message: 'Product not found' });
    } catch (error) {
        console.error("Get Product By ID Error:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a product
// @route   POST /products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { title, description, price, category, image, stock, rating, numReviews, featured } = req.body;

    try {
        const product = new Product({
            title,
            description,
            price,
            category,
            image,
            stock: stock !== undefined ? stock : 10,
            rating: rating !== undefined ? rating : 4.5,
            numReviews: numReviews !== undefined ? numReviews : 0,
            featured: featured !== undefined ? featured : false
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(400).json({ message: 'Invalid product data', error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { title, description, price, category, image, stock, rating, numReviews, featured } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            if (title !== undefined) product.title = title;
            if (description !== undefined) product.description = description;
            if (price !== undefined) product.price = price;
            if (category !== undefined) product.category = category;
            if (image !== undefined) product.image = image;
            if (stock !== undefined) product.stock = stock;
            if (rating !== undefined) product.rating = rating;
            if (numReviews !== undefined) product.numReviews = numReviews;
            if (featured !== undefined) product.featured = featured;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a product
// @route   DELETE /products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    FALLBACK_PRODUCTS,
    filterFallback
};
