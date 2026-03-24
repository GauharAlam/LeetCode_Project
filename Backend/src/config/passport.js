const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/user/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ 
            $or: [
                { googleId: profile.id },
                { emailId: email }
            ]
        });

        if (user) {
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            return done(null, user);
        }

        // Create new user
        user = await User.create({
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || '',
            emailId: email,
            googleId: profile.id,
            isVerified: true // Social login users are pre-verified
        });

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/user/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
        let user = await User.findOne({ 
            $or: [
                { githubId: profile.id },
                { emailId: email }
            ]
        });

        if (user) {
            if (!user.githubId) {
                user.githubId = profile.id;
                await user.save();
            }
            return done(null, user);
        }

        // Create new user
        user = await User.create({
            firstName: profile.displayName || profile.username,
            lastName: '',
            emailId: email,
            githubId: profile.id,
            isVerified: true
        });

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

// We don't need serialize/deserialize if we are using JWT in cookies
// but passport might require them if session is true (default).
// We'll set session: false in the route.

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
