const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@leko.com' },
    update: {},
    create: { email: 'admin@leko.com', password, name: 'Admin', role: 'SUPER_ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'manager@lekocom' },
    update: {},
    create: { email: 'manager@lekocom', password, name: 'Manager', role: 'ADMIN' },
  });

  const products = [
    {
      referenceNumber: 'E00001',
      category: 'Excavators',
      brand: 'Caterpillar',
      model: '390F LME',
      year: 2018,
      hours: 12689,
      condition: 'USED',
      price: null,
      priceOnRequest: true,
      inYard: true,
      location: 'Demo, Locatioon',
      highlights: 'VG UNDERCARRIAGE - CE/EPA',
      featured: true,
      translations: [
        { locale: 'en', title: 'Caterpillar 390F LME Excavator', description: 'Large hydraulic excavator in excellent condition. Very good undercarriage, CE/EPA certified. Ready for immediate deployment.' },
        { locale: 'de', title: 'Caterpillar 390F LME Bagger', description: 'Großer Hydraulikbagger in ausgezeichnetem Zustand. Sehr gutes Fahrwerk, CE/EPA zertifiziert.' },
        { locale: 'uk', title: 'Екскаватор Caterpillar 390F LME', description: 'Великий гідравлічний екскаватор у відмінному стані. Дуже гарний ходовий механізм, сертифікат CE/EPA.' },
      ],
    },
    {
      referenceNumber: 'E00002',
      category: 'Excavators',
      brand: 'Komatsu',
      model: 'PC360LC-11',
      year: 2020,
      hours: 7450,
      condition: 'USED',
      price: 185000,
      priceOnRequest: false,
      inYard: true,
      location: 'Demo, Locatioon',
      highlights: 'LOW HOURS - FULL SERVICE HISTORY',
      featured: true,
      translations: [
        { locale: 'en', title: 'Komatsu PC360LC-11 Excavator', description: 'Medium-large excavator with low hours and full service history. Excellent working condition.' },
        { locale: 'de', title: 'Komatsu PC360LC-11 Bagger', description: 'Mittelgroßer Bagger mit niedrigen Betriebsstunden und vollständiger Servicehistorie.' },
        { locale: 'uk', title: 'Екскаватор Komatsu PC360LC-11', description: 'Середньовеликий екскаватор з низьким напрацюванням та повною сервісною історією.' },
      ],
    },
    {
      referenceNumber: 'D00001',
      category: 'Dozers',
      brand: 'Caterpillar',
      model: 'D8T',
      year: 2017,
      hours: 18340,
      condition: 'USED',
      price: 220000,
      priceOnRequest: false,
      inYard: true,
      location: 'Demo, Locatioon',
      highlights: 'RIPPER ATTACHED - GOOD UNDERCARRIAGE',
      featured: true,
      translations: [
        { locale: 'en', title: 'Caterpillar D8T Bulldozer', description: 'Heavy duty bulldozer with ripper. Good undercarriage condition. Suitable for heavy earthmoving operations.' },
        { locale: 'de', title: 'Caterpillar D8T Planierraupe', description: 'Schwere Planierraupe mit Reißer. Guter Fahrwerkszustand. Geeignet für schwere Erdbewegungsarbeiten.' },
        { locale: 'uk', title: 'Бульдозер Caterpillar D8T', description: 'Важкий бульдозер з рипером. Гарний стан ходового механізму. Підходить для важких земляних робіт.' },
      ],
    },
    {
      referenceNumber: 'L00001',
      category: 'Loaders',
      brand: 'Volvo',
      model: 'L120H',
      year: 2019,
      hours: 9200,
      condition: 'USED',
      price: 145000,
      priceOnRequest: false,
      inYard: true,
      location: 'Demo, Locatioon',
      highlights: 'EXCELLENT CONDITION - NEW TYRES',
      featured: false,
      translations: [
        { locale: 'en', title: 'Volvo L120H Wheel Loader', description: 'Large wheel loader in excellent condition. New tyres fitted. Ready for work.' },
        { locale: 'de', title: 'Volvo L120H Radlader', description: 'Großer Radlader in ausgezeichnetem Zustand. Neue Reifen montiert.' },
        { locale: 'uk', title: 'Колісний навантажувач Volvo L120H', description: 'Великий колісний навантажувач у відмінному стані. Нові шини.' },
      ],
    },
    {
      referenceNumber: 'C00001',
      category: 'Cranes',
      brand: 'Liebherr',
      model: 'LTM 1100-5.2',
      year: 2016,
      hours: 22100,
      condition: 'USED',
      price: null,
      priceOnRequest: true,
      inYard: false,
      location: 'Hamburg, Locatioon',
      highlights: '100T CAPACITY - FULL DOCUMENTATION',
      featured: true,
      translations: [
        { locale: 'en', title: 'Liebherr LTM 1100-5.2 Mobile Crane', description: '100-tonne all-terrain mobile crane. Full documentation available. Currently located in Hamburg.' },
        { locale: 'de', title: 'Liebherr LTM 1100-5.2 Mobilkran', description: '100-Tonnen-Geländekran. Vollständige Dokumentation vorhanden. Derzeit in Hamburg.' },
        { locale: 'uk', title: 'Мобільний кран Liebherr LTM 1100-5.2', description: 'Всюдихідний мобільний кран вантажопідйомністю 100 тонн. Повна документація.' },
      ],
    },
    {
      referenceNumber: 'T00001',
      category: 'Tractors',
      brand: 'John Deere',
      model: '8R 410',
      year: 2021,
      hours: 3200,
      condition: 'USED',
      price: 310000,
      priceOnRequest: false,
      inYard: true,
      location: 'Demo, Locatioon',
      highlights: 'GPS READY - POWERSHIFT',
      featured: false,
      translations: [
        { locale: 'en', title: 'John Deere 8R 410 Tractor', description: 'High-power row crop tractor with GPS ready system and powershift transmission. Low hours.' },
        { locale: 'de', title: 'John Deere 8R 410 Traktor', description: 'Hochleistungs-Ackerschlepper mit GPS-System und Powershift-Getriebe. Niedrige Betriebsstunden.' },
        { locale: 'uk', title: 'Трактор John Deere 8R 410', description: 'Потужний трактор з GPS системою та powershift трансмісією. Низьке напрацювання.' },
      ],
    },
    {
      referenceNumber: 'H00001',
      category: 'Harvesters',
      brand: 'Claas',
      model: 'Lexion 8900',
      year: 2022,
      hours: 1850,
      condition: 'USED',
      price: 580000,
      priceOnRequest: false,
      inYard: true,
      location: 'Demo, Locatioon',
      highlights: 'ALMOST NEW - FULL WARRANTY',
      featured: true,
      translations: [
        { locale: 'en', title: 'Claas Lexion 8900 Combine Harvester', description: 'Top-of-the-line combine harvester with very low hours. Almost new condition with remaining warranty.' },
        { locale: 'de', title: 'Claas Lexion 8900 Mähdrescher', description: 'Spitzenklasse-Mähdrescher mit sehr niedrigen Betriebsstunden. Nahezu neuer Zustand mit Restgarantie.' },
        { locale: 'uk', title: 'Комбайн Claas Lexion 8900', description: 'Комбайн вищого класу з дуже низьким напрацюванням. Майже новий стан із залишковою гарантією.' },
      ],
    },
    {
      referenceNumber: 'DT00001',
      category: 'Dump Trucks',
      brand: 'Volvo',
      model: 'A40G',
      year: 2019,
      hours: 14500,
      condition: 'USED',
      price: 195000,
      priceOnRequest: false,
      inYard: true,
      location: 'Demo, Locatioon',
      highlights: 'GOOD CONDITION - READY TO WORK',
      featured: false,
      translations: [
        { locale: 'en', title: 'Volvo A40G Articulated Dump Truck', description: '40-tonne articulated dump truck in good working condition. Suitable for quarry and construction site work.' },
        { locale: 'de', title: 'Volvo A40G Knicklenker-Dumper', description: '40-Tonnen-Knicklenker-Dumper in gutem Betriebszustand. Geeignet für Steinbruch- und Baustellenarbeiten.' },
        { locale: 'uk', title: 'Самоскид Volvo A40G', description: 'Зчленований самоскид вантажністю 40 тонн у гарному робочому стані.' },
      ],
    },
  ];

  for (const p of products) {
    const { translations, ...data } = p;
    await prisma.product.upsert({
      where: { referenceNumber: data.referenceNumber },
      update: {},
      create: {
        ...data,
        translations: { create: translations },
      },
    });
  }

  console.log('✅ Seed completed: 2 users + 8 products');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
