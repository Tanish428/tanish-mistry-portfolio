import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Admin from '../src/modules/auth/admin.model.js';
import { validateProvisioningInput } from '../src/modules/auth/auth.validation.js';

dotenv.config();

const createAdmin = async () => {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const { isValid, error } = validateProvisioningInput({ name, email, password });

  if (!isValid) {
    console.error(`Provisioning validation failed: ${error}`);
    console.error('Please ensure ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (min 12 chars, max 72 bytes) are configured.');
    process.exit(1);
  }

  try {
    await connectDB();

    // Ensure database indexes are fully built
    await Admin.init();

    // Check if an administrator already exists
    const existingAdmin = await Admin.findOne({ singletonKey: 'primary' });

    if (existingAdmin) {
      console.warn('Notice: An administrator account has already been provisioned.');
      console.warn(`Existing administrator email: ${existingAdmin.email}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create the single administrator record
    await Admin.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password, // Automatically hashed by Mongoose pre-save hook
      singletonKey: 'primary',
    });

    console.log('Success: Administrator account provisioned successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    if (err.code === 11000) {
      console.warn('Notice: An administrator account already exists (duplicate key detected).');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.error(`Error during administrator provisioning: ${err.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

createAdmin();
