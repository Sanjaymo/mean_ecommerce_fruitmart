const User = require('./models/User');

async function seedAdmin() {
  const existing = await User.findOne({ role: 'admin' });
  if (existing) return;

  await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    phone: process.env.ADMIN_PHONE,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
  });
  console.log('Admin user seeded');
}

module.exports = seedAdmin;
