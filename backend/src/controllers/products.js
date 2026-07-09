const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

const getProducts = async (req, res) => {
  try {
    const {
      locale = 'en',
      category,
      brand,
      model,
      yearFrom,
      yearTo,
      hoursFrom,
      hoursTo,
      priceFrom,
      priceTo,
      inYard,
      condition,
      search,
      sortBy = 'featured',
      page = 1,
      limit = 12,
    } = req.query;

    const where = { active: true };

    if (category) where.category = category;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };
    if (condition) where.condition = condition.toUpperCase();
    if (inYard !== undefined) where.inYard = inYard === 'true';
    if (yearFrom || yearTo) {
      where.year = {};
      if (yearFrom) where.year.gte = parseInt(yearFrom, 10);
      if (yearTo) where.year.lte = parseInt(yearTo, 10);
    }
    if (hoursFrom || hoursTo) {
      where.hours = {};
      if (hoursFrom) where.hours.gte = parseInt(hoursFrom, 10);
      if (hoursTo) where.hours.lte = parseInt(hoursTo, 10);
    }
    if (priceFrom || priceTo) {
      where.price = {};
      if (priceFrom) where.price.gte = parseFloat(priceFrom);
      if (priceTo) where.price.lte = parseFloat(priceTo);
    }
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { translations: { some: { locale, title: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const orderBy = {
      featured: [{ featured: 'desc' }, { createdAt: 'desc' }],
      newest: [{ year: 'desc' }],
      oldest: [{ year: 'asc' }],
      hoursAsc: [{ hours: 'asc' }],
      hoursDesc: [{ hours: 'desc' }],
      priceAsc: [{ price: 'asc' }],
      priceDesc: [{ price: 'desc' }],
    }[sortBy] || [{ featured: 'desc' }];

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          translations: { where: { locale } },
          photos: { orderBy: { order: 'asc' } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProduct = async (req, res) => {
  const { id } = req.params;
  const { locale = 'en' } = req.query;

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: parseInt(id, 10) || 0 },
          { referenceNumber: id.toUpperCase() },
        ],
        active: true,
      },
      include: {
        translations: { where: { locale } },
        photos: { orderBy: { order: 'asc' } },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('getProduct error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: { active: true },
      _count: { category: true },
      orderBy: { category: 'asc' },
    });

    res.json(
      categories.map((c) => ({
        name: c.category,
        count: c._count.category,
      }))
    );
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFilters = async (req, res) => {
  const { category } = req.query;
  const where = { active: true };
  if (category) where.category = category;

  try {
    const [brands, years, hours] = await Promise.all([
      prisma.product.groupBy({
        by: ['brand'],
        where,
        _count: { brand: true },
        orderBy: { brand: 'asc' },
      }),
      prisma.product.aggregate({
        where,
        _min: { year: true },
        _max: { year: true },
      }),
      prisma.product.aggregate({
        where,
        _min: { hours: true },
        _max: { hours: true },
      }),
    ]);

    res.json({
      brands: brands.map((b) => ({ name: b.brand, count: b._count.brand })),
      yearRange: { min: years._min.year, max: years._max.year },
      hoursRange: { min: hours._min.hours, max: hours._max.hours },
    });
  } catch (error) {
    console.error('getFilters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

const createProduct = async (req, res) => {
  try {
    const {
      referenceNumber, category, brand, model, year, hours,
      condition, price, priceOnRequest, inYard, location,
      highlights, featured, translations,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        referenceNumber: referenceNumber.toUpperCase(),
        category, brand, model,
        year: year ? parseInt(year, 10) : null,
        hours: hours ? parseInt(hours, 10) : null,
        condition: condition || 'USED',
        price: price ? parseFloat(price) : null,
        priceOnRequest: priceOnRequest ?? true,
        inYard: inYard ?? true,
        location, highlights,
        featured: featured ?? false,
        translations: translations
          ? { create: translations }
          : undefined,
      },
      include: {
        translations: true,
        photos: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Reference number already exists' });
    }
    console.error('createProduct error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      referenceNumber, category, brand, model, year, hours,
      condition, price, priceOnRequest, inYard, location,
      highlights, featured, active, translations,
    } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: {
        referenceNumber: referenceNumber?.toUpperCase(),
        category, brand, model,
        year: year ? parseInt(year, 10) : undefined,
        hours: hours ? parseInt(hours, 10) : undefined,
        condition,
        price: price ? parseFloat(price) : undefined,
        priceOnRequest, inYard, location, highlights, featured, active,
      },
      include: { translations: true, photos: true },
    });

    // Оновлюємо переклади якщо передані
    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        await prisma.productTranslation.upsert({
          where: { productId_locale: { productId: product.id, locale: t.locale } },
          update: { title: t.title, description: t.description },
          create: { productId: product.id, locale: t.locale, title: t.title, description: t.description },
        });
      }
    }

    res.json(product);
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: { photos: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Видаляємо фото з диску
    for (const photo of product.photos) {
      const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', photo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.product.delete({ where: { id: parseInt(id, 10) } });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const uploadPhotos = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: { photos: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingCount = product.photos.length;

    const photos = await Promise.all(
      req.files.map((file, index) =>
        prisma.productPhoto.create({
          data: {
            productId: parseInt(id, 10),
            filename: file.filename,
            isPrimary: existingCount === 0 && index === 0,
            order: existingCount + index,
          },
        })
      )
    );

    res.status(201).json(photos);
  } catch (error) {
    console.error('uploadPhotos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deletePhoto = async (req, res) => {
  const { photoId } = req.params;

  try {
    const photo = await prisma.productPhoto.findUnique({
      where: { id: parseInt(photoId, 10) },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.productPhoto.delete({ where: { id: parseInt(photoId, 10) } });

    res.json({ message: 'Photo deleted' });
  } catch (error) {
    console.error('deletePhoto error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          photos: { where: { isPrimary: true }, take: 1 },
          translations: { where: { locale: 'en' }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      meta: { total, page: parseInt(page, 10), limit: take, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('getAdminProducts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProducts,
  getProduct,
  getCategories,
  getFilters,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadPhotos,
  deletePhoto,
  getAdminProducts,
};
