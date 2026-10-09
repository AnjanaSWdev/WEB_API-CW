require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Province = require('../models/Province');
const District = require('../models/District');
const GridSubstation = require('../models/GridSubstation');
const SolarInstallation = require('../models/SolarInstallation');
const GenerationReading = require('../models/GenerationReading');

const { ObjectId } = mongoose.Types;

function withObjectId(doc, ...fields) {
  const out = { ...doc };
  for (const f of fields) {
    if (out[f] !== undefined && out[f] !== null) out[f] = new ObjectId(out[f]);
  }
  if (out._id !== undefined) out._id = new ObjectId(out._id);
  return out;
}

async function run() {
  await connectDB();

  const geoPath = path.join(__dirname, 'seed_geo.json');
  const readingsPath = path.join(__dirname, 'seed_readings.json');

  const geo = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
  const readings = JSON.parse(fs.readFileSync(readingsPath, 'utf8'));

  console.log('Clearing existing collections...');
  await Promise.all([
    Province.deleteMany({}),
    District.deleteMany({}),
    GridSubstation.deleteMany({}),
    SolarInstallation.deleteMany({}),
    GenerationReading.deleteMany({})
  ]);

  console.log(`Inserting ${geo.provinces.length} provinces...`);
  await Province.insertMany(geo.provinces.map((d) => withObjectId(d)));

  console.log(`Inserting ${geo.districts.length} districts...`);
  await District.insertMany(geo.districts.map((d) => withObjectId(d, 'provinceId')));

  console.log(`Inserting ${geo.substations.length} substations...`);
  await GridSubstation.insertMany(geo.substations.map((d) => withObjectId(d, 'districtId')));

  console.log(`Inserting ${geo.installations.length} installations...`);
  await SolarInstallation.insertMany(geo.installations.map((d) => withObjectId(d, 'substationId')));

  console.log(`Inserting ${readings.length} readings (in batches)...`);
  const BATCH_SIZE = 5000;
  for (let i = 0; i < readings.length; i += BATCH_SIZE) {
    const batch = readings
      .slice(i, i + BATCH_SIZE)
      .map((r) => withObjectId(r, 'installationId'));
    await GenerationReading.insertMany(batch, { ordered: false });
    console.log(`  ${Math.min(i + BATCH_SIZE, readings.length)}/${readings.length}`);
  }

  console.log('Seeding complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});