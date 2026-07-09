require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'leko-secret-key';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// ─── Папка для фото ───────────────────────────────────────────────────────────
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Only images allowed'));
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

// ─── JSON helpers ─────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
const writeJSON = (file, data) => fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));

// ─── Auth middleware ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

// ─── PRODUCTS HELPERS ─────────────────────────────────────────────────────────
function getProducts() { return readJSON('products.json'); }
function saveProducts(products) { writeJSON('products.json', products); }
function nextId(products) { return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1; }

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/products — список з фільтрами
app.get('/api/products', (req, res) => {
  const { locale = 'en', category, brand, condition, inYard, search,
    yearFrom, yearTo, hoursFrom, hoursTo, priceFrom, priceTo,
    sortBy = 'featured', page = 1, limit = 12 } = req.query;

  let products = getProducts().filter(p => p.active);

  if (category) {
    const cats = category.split(',').map(c => c.trim());
    products = products.filter(p => cats.includes(p.category));
  }
  if (brand) products = products.filter(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
  if (condition) products = products.filter(p => p.condition === condition.toUpperCase());
  if (inYard === 'true') products = products.filter(p => p.inYard);
  if (yearFrom) products = products.filter(p => p.year >= parseInt(yearFrom));
  if (yearTo) products = products.filter(p => p.year <= parseInt(yearTo));
  if (hoursFrom) products = products.filter(p => p.hours >= parseInt(hoursFrom));
  if (hoursTo) products = products.filter(p => p.hours <= parseInt(hoursTo));
  if (priceFrom) products = products.filter(p => !p.priceOnRequest && p.price >= parseFloat(priceFrom));
  if (priceTo) products = products.filter(p => !p.priceOnRequest && p.price <= parseFloat(priceTo));
  if (search) {
    const s = search.toLowerCase();
    products = products.filter(p =>
      p.brand.toLowerCase().includes(s) ||
      p.model.toLowerCase().includes(s) ||
      p.referenceNumber.toLowerCase().includes(s) ||
      p.translations.some(t => t.title.toLowerCase().includes(s))
    );
  }

  // Sort
  const sorters = {
    featured: (a, b) => (b.featured - a.featured) || (b.id - a.id),
    newest: (a, b) => (b.year || 0) - (a.year || 0),
    oldest: (a, b) => (a.year || 0) - (b.year || 0),
    hoursAsc: (a, b) => (a.hours || 0) - (b.hours || 0),
    hoursDesc: (a, b) => (b.hours || 0) - (a.hours || 0),
    priceAsc: (a, b) => (a.price || 0) - (b.price || 0),
    priceDesc: (a, b) => (b.price || 0) - (a.price || 0),
  };
  products.sort(sorters[sortBy] || sorters.featured);

  const total = products.length;
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;
  const paginated = products.slice(skip, skip + take).map(p => ({
    ...p,
    translations: p.translations.filter(t => t.locale === locale),
  }));

  res.json({ data: paginated, meta: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } });
});

// GET /api/products/categories
app.get('/api/products/categories', (req, res) => {
  const products = getProducts().filter(p => p.active);
  const map = {};
  products.forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
  res.json(Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count })));
});

// GET /api/products/filters
app.get('/api/products/filters', (req, res) => {
  const { category } = req.query;
  let products = getProducts().filter(p => p.active);
  if (category) {
    const cats = category.split(',').map(c => c.trim());
    products = products.filter(p => cats.includes(p.category));
  }

  const brands = {};
  products.forEach(p => { brands[p.brand] = (brands[p.brand] || 0) + 1; });

  const years = products.map(p => p.year).filter(Boolean);
  const hours = products.map(p => p.hours).filter(h => h != null);

  res.json({
    brands: Object.entries(brands).sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count })),
    yearRange: { min: years.length ? Math.min(...years) : null, max: years.length ? Math.max(...years) : null },
    hoursRange: { min: hours.length ? Math.min(...hours) : null, max: hours.length ? Math.max(...hours) : null },
  });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const { locale = 'en' } = req.query;
  const products = getProducts();
  const product = products.find(p =>
    (p.id === parseInt(req.params.id) || p.referenceNumber === req.params.id.toUpperCase()) && p.active
  );
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ ...product, translations: product.translations.filter(t => t.locale === locale) });
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/products/admin/list
app.get('/api/products/admin/list', authMiddleware, (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  let products = getProducts();
  if (search) {
    const s = search.toLowerCase();
    products = products.filter(p =>
      p.brand.toLowerCase().includes(s) ||
      p.model.toLowerCase().includes(s) ||
      p.referenceNumber.toLowerCase().includes(s)
    );
  }
  const total = products.length;
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;
  const paginated = products.slice(skip, skip + take).map(p => ({
    ...p,
    translations: p.translations.filter(t => t.locale === 'en').slice(0, 1),
    photos: p.photos.filter(ph => ph.isPrimary).slice(0, 1),
  }));
  res.json({ data: paginated, meta: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } });
});

// POST /api/products
app.post('/api/products', authMiddleware, (req, res) => {
  const products = getProducts();
  const { translations, ...data } = req.body;
  const product = {
    ...data,
    id: nextId(products),
    referenceNumber: data.referenceNumber.toUpperCase(),
    year: data.year ? parseInt(data.year) : null,
    hours: data.hours ? parseInt(data.hours) : null,
    price: data.price ? parseFloat(data.price) : null,
    condition: data.condition || 'USED',
    active: data.active ?? true,
    featured: data.featured ?? false,
    priceOnRequest: data.priceOnRequest ?? true,
    inYard: data.inYard ?? true,
    photos: [],
    translations: translations || [],
  };
  if (products.find(p => p.referenceNumber === product.referenceNumber)) {
    return res.status(409).json({ error: 'Reference number already exists' });
  }
  products.push(product);
  saveProducts(products);
  res.status(201).json(product);
});

// PUT /api/products/:id
app.put('/api/products/:id', authMiddleware, (req, res) => {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const { translations, ...data } = req.body;
  const existing = products[idx];

  products[idx] = {
    ...existing,
    ...data,
    id: existing.id,
    referenceNumber: data.referenceNumber?.toUpperCase() || existing.referenceNumber,
    year: data.year ? parseInt(data.year) : existing.year,
    hours: data.hours ? parseInt(data.hours) : existing.hours,
    price: data.price ? parseFloat(data.price) : existing.price,
    photos: existing.photos,
    translations: translations
      ? translations.map(t => ({ locale: t.locale, title: t.title, description: t.description || '' }))
      : existing.translations,
  };

  saveProducts(products);
  res.json(products[idx]);
});

// DELETE /api/products/:id
app.delete('/api/products/:id', authMiddleware, (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Видаляємо фото з диску
  product.photos.forEach(ph => {
    const filePath = path.join(UPLOAD_DIR, ph.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  saveProducts(products.filter(p => p.id !== parseInt(req.params.id)));
  res.json({ message: 'Product deleted' });
});

// POST /api/products/:id/photos
app.post('/api/products/:id/photos', authMiddleware, upload.array('photos', 10), (req, res) => {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

  const existing = products[idx].photos;
  const newPhotos = req.files.map((file, i) => ({
    id: Date.now() + i,
    filename: file.filename,
    isPrimary: existing.length === 0 && i === 0,
    order: existing.length + i,
  }));

  products[idx].photos = [...existing, ...newPhotos];
  saveProducts(products);
  res.status(201).json(newPhotos);
});

// DELETE /api/products/photos/:photoId
app.delete('/api/products/photos/:photoId', authMiddleware, (req, res) => {
  const products = getProducts();
  const photoId = parseInt(req.params.photoId);
  let found = false;

  for (const product of products) {
    const photo = product.photos.find(ph => ph.id === photoId);
    if (photo) {
      const filePath = path.join(UPLOAD_DIR, photo.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      product.photos = product.photos.filter(ph => ph.id !== photoId);
      found = true;
      break;
    }
  }

  if (!found) return res.status(404).json({ error: 'Photo not found' });
  saveProducts(products);
  res.json({ message: 'Photo deleted' });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Serve frontend in production ────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'public');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`🚀 Leko GmbH API running on http://localhost:${PORT}`));
