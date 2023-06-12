const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  GoogleStrategy = require("passport-google-oauth2").Strategy,
  FacebookStrategy = require("passport-facebook").Strategy,
  { User } = require("../server/models"),
  Logger = require("../server/utilities/logger");

module.exports = (passport) => {
  passport.use(
    "user-jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      (payload, done) => {
        User.findOne({ _id: payload._id })
          .then((user) => {
            if (!user) {
              Logger.error("Unauthorized." + `UserId: ${payload._id}`);
              return done(null, false, { message: "Unauthorized." });
            }
            Logger.info("Authorized. " + `UserId: ${payload._id}`);
            return done(null, user, { message: "Authorized." });
          })
          .catch((err) => {
            Logger.error(err + " - Auth failure. Try again. " + ` UserId: ${payload._id}`);
            done(null, false, { message: "Auth failure. Try again." });
          });
      }
    )
  );
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http${process.env.NODE_ENV == "development" ? "" : "s"}://${process.env.NODE_ENV == "development" ? process.env.STAGE_HOSTNAME + ":" + process.env.PORT : process.env.PROD_HOSTNAME}/${process.env.API_VERSION}/auth/google/callback`,
        passReqToCallback: true,
      },
      (request, accessToken, refreshToken, profile, done) => {
        User.findOneAndUpdate(
          { user_email: profile.email },
          {
            $setOnInsert: { user_first_name: profile.name.givenName || "", user_last_name: profile.name.familyName || "", user_email: profile.email, user_status: "Verified" },
          },
          { upsert: true, new: true },
          (err, user) => {
            return done(err, user);
          }
        );
      }
    )
  );
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `http${process.env.NODE_ENV == "development" ? "" : "s"}://${process.env.NODE_ENV == "development" ? process.env.STAGE_HOSTNAME + ":" + process.env.PORT : process.env.PROD_HOSTNAME}/${process.env.API_VERSION}/auth/facebook/callback`,
        profileFields: ["id", "displayName", "photos", "email", "gender", "name"],
      },
      (accessToken, refreshToken, profile, done) => {
        User.findOneAndUpdate(
          { user_email: profile.emails[0].value },
          {
            $setOnInsert: { user_first_name: profile.displayName.split(" ")[0] || "", user_last_name: profile.displayName.split(" ")[1] || "", user_email: profile.emails[0].value, user_status: "Verified" },
          },
          { upsert: true, new: true },
          (err, user) => {
            return done(err, user);
          }
        );
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
