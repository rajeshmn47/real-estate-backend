// seedProperties.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const City = require('../models/City');
const Property = require('../models/Property');

const propertyTypes = ['Apartment', 'Villa', 'PG', 'Plot', 'Commercial'];
const listingTypes = ['Buy', 'Rent', 'Commercial', 'PG/Co-Living', 'Plots'];
const propertyNames = [
  'Luxury 3 BHK', 'Spacious 4 BHK', 'Cozy 2 BHK', 'Independent House',
  'Penthouse', 'Studio Apartment', 'Row House', 'Farmhouse',
  'Commercial Shop', 'Office Space', 'Plot for Construction'
];
const locations = [
  'Near Metro Station', 'Close to Airport', 'IT Hub', 'Market Area',
  'Residential Colony', 'University Area', 'Hospital Road', 'Lake View'
];
const featuresList = [
  ['Swimming Pool', 'Gym'], ['Garden', 'Parking'], ['Security', 'Power Backup'],
  ['Furnished', 'Wi-Fi'], ['Jacuzzi', 'Terrace'], ['Clubhouse', 'Playground'],
  ['Air Conditioning', 'Parking']
];

const generateRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedProperties = async () => {
  try {
    // Use your MongoDB URI from .env, or fallback to local
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/housing');
    console.log('✅ MongoDB connected');

    const cities = await City.find();
    if (!cities.length) {
      console.log('❌ No cities found. Please seed cities first.');
      process.exit(1);
    }

    const users = await User.find();
    if (!users.length) {
      console.log('❌ No users found. Please create at least one user first.');
      process.exit(1);
    }
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const count = 30;
    const properties = [];

    for (let i = 0; i < count; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const type = generateRandom(propertyTypes);
      const listing = generateRandom(listingTypes);
      const area = Math.floor(Math.random() * 2000) + 400;
      const bedrooms = Math.floor(Math.random() * 5); // 0–4
      const bathrooms = Math.min(bedrooms + 1, 3);
      const price = (Math.floor(Math.random() * 200) + 20) * 100000; // 20–220 Lakhs

      properties.push({
        title: `${generateRandom(propertyNames)} in ${city.name}`,
        description: `Beautiful property with ${bedrooms} bedrooms, ${bathrooms} bathrooms, area ${area} sq.ft. Located ${generateRandom(locations)}.`,
        price: price,
        area: area,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        propertyType: type,
        listingType: listing,
        location: `${generateRandom(locations)}, ${city.name}`,
        city: city._id,                    // ✅ ObjectId reference
        locality: null,                    // optional – set to null
        state: city.state,
        zipCode: (100000 + Math.floor(Math.random() * 900000)).toString(),
        images: [`https://picsum.photos/seed/${i+1}/400/300`],
        features: generateRandom(featuresList),
        isVerified: Math.random() > 0.3,
        isPublished: true,
        postedBy: randomUser._id,
        views: Math.floor(Math.random() * 100),
        // createdAt and updatedAt will be auto-added by timestamps
      });
    }

    // Insert all properties
    await Property.insertMany(properties);
    console.log(`✅ ${count} properties created successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding properties:', error);
    process.exit(1);
  }
};

seedProperties();