// Script to create admin/seller users
// Run with: node create-user.js

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createUser() {
    console.log('\n🔐 User Creation Tool\n');
    console.log('This will generate a MongoDB document for a new user.\n');

    const name = await question('Enter name: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');

    console.log('\nSelect role:');
    console.log('1. Admin (full access)');
    console.log('2. Seller/Reseller (manage products & orders)');
    console.log('3. Customer (regular user)');
    const roleChoice = await question('Enter choice (1-3): ');

    const roleMap = {
        '1': 'admin',
        '2': 'seller',
        '3': 'customer'
    };

    const role = roleMap[roleChoice] || 'customer';

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate MongoDB document
    const userDocument = {
        name: name,
        email: email,
        password: hashedPassword,
        role: role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    console.log('\n✅ User document created!\n');
    console.log('Copy and paste this into MongoDB:\n');
    console.log(JSON.stringify(userDocument, null, 2));
    console.log('\n📋 Instructions:');
    console.log('1. Open MongoDB Compass or MongoDB Shell');
    console.log('2. Connect to: mongodb://localhost:27017/ecommerce');
    console.log('3. Go to the "users" collection');
    console.log('4. Click "Insert Document"');
    console.log('5. Paste the JSON above');
    console.log('6. Click "Insert"\n');

    console.log('🔑 Login Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}\n`);

    rl.close();
}

createUser().catch(console.error);
