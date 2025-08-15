import { connectMongoDB, disconnectMongoDB } from "#lib/mongodb.js";
import GlobalAdmin from "#models/superadmin/globalAdmin.model.js";
import logger from "#config/logger.js";
import config from "#config/index.js";

/**
 * Seed the Global Super Admin if none exists
 */
const seedGlobalAdmin = async () => {
  try {
    await connectMongoDB();

    const email = process.env.SEED_GLOBAL_ADMIN_EMAIL;
    const password = process.env.SEED_GLOBAL_ADMIN_PASSWORD;

    if (!email || !password) {
      logger.error(
        "SEED_GLOBAL_ADMIN_EMAIL and SEED_GLOBAL_ADMIN_PASSWORD must be set in .env",
      );
      process.exit(1);
    }

    const existingAdmin = await GlobalAdmin.findOne({
      role: "global_super_admin",
    });
    if (existingAdmin) {
      logger.info(`Global Super Admin already exists: ${existingAdmin.email}`);
      await disconnectMongoDB();
      return;
    }

    const admin = await GlobalAdmin.create({
      email,
      password,
      role: "global_super_admin",
    });
    logger.info(
      `Global Super Admin created: ID=${admin._id}, Email=${admin.email}`,
    );
    await disconnectMongoDB();
  } catch (error) {
    logger.error(`Seed Global Super Admin error: ${error.message}`);
    await disconnectMongoDB();
    process.exit(1);
  }
};

seedGlobalAdmin();
