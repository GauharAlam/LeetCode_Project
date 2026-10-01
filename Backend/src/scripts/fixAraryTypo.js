/**
 * Fix 'arary' tag typo to 'Array' in MongoDB.
 * Run: node fixAraryTypo.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function fixTypo() {
    try {
        const mongoUri = process.env.DB_CONNECT_STRING || process.env.MONGO_URL || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ No MongoDB URI found in .env');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const problemsCollection = db.collection('problems');

        // Update all documents that have 'arary' in their tags array
        const result = await problemsCollection.updateMany(
            { tags: 'arary' },
            { $set: { 'tags.$[elem]': 'Array' } },
            { arrayFilters: [{ elem: 'arary' }] }
        );

        console.log(`✅ Fixed ${result.modifiedCount} problems with 'arary' → 'Array'`);

        // Also check study plans topics
        const studyPlansCollection = db.collection('studyplans');
        const spResult = await studyPlansCollection.updateMany(
            { topics: 'arary' },
            { $set: { 'topics.$[elem]': 'Array' } },
            { arrayFilters: [{ elem: 'arary' }] }
        );

        console.log(`✅ Fixed ${spResult.modifiedCount} study plans with 'arary' → 'Array'`);

        await mongoose.disconnect();
        console.log('✅ Done. Disconnected.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

fixTypo();
