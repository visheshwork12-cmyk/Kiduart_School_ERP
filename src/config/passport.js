import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import config from "#config/index.js";
import logger from "#config/logger.js";
// Placeholder for User model (to be implemented)
import User from "#models/user.model.js";

/**
 * JWT strategy options
 * @type {Object}
 */
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
};

/**
 * Configure JWT authentication strategy
 */
passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      // TODO: Replace with actual User model lookup
      const user = await User.findById(jwtPayload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      logger.error(`Passport JWT error: ${error.message}`);
      return done(error, false);
    }
  }),
);

/**
 * Initialize Passport
 * @type {Object}
 */
const passportInit = passport.initialize();

// TODO: Add additional strategies (e.g., local auth, OAuth) as needed

export default passportInit;
