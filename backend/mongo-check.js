const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected!');

        console.log('Testing Write Permission...');
        const TestModel = mongoose.model('TestWrite', new mongoose.Schema({ name: String }));
        const doc = new TestModel({ name: 'write-test-' + Date.now() });
        await doc.save();
        console.log('Write Success! Document ID:', doc._id);

        console.log('Testing Delete Permission...');
        await TestModel.deleteOne({ _id: doc._id });
        console.log('Delete Success!');

        console.log('DB Connection and Permissions are GOOD.');
    } catch (err) {
        console.error('DB Operation Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
