import passport from 'passport';
import { isTokenBlacklisted, setTokens, tokenValidation } from '../../utils/tokens';

// Bearer middleware
export const bearer = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async function (err, user, info) {
        try {
            // Error thrown
            if (err) return next(err);
            // Check if token is blacklisted
            if (await isTokenBlacklisted(req)) return res.status(401).json({ error: 'Token is blacklisted.' });
            // Authentication Error
            if (!user) return res.status(401).json({ error: 'Unauthenticated.' });
            // Set user on req.
            req.user = user;
            // User is connected.
            next();
        } catch (e) {            
            return tokenValidation(e, res);
        }
    })(req, res, next);
};

// Login middleware
export const login = (req, res, next) => {
    passport.authenticate('local', { session: false }, function (err, user, info) {
        // Error thrown
        if (err) return next(err);
        // Authentication Error
        if (!user) return res.status(401).json({ error: req.__('LoginFailed') });

        req.login(user, { session: false }, async (err) => {
            if (err) {
                return res.send(err);
            }
            // Set locale
            const { locale } = req.cookies;
            if (locale) {
                if (user.locale !== locale) {
                    user.locale = locale;
                    await user.save();
                }
            }
            // Set tokens
            const { token, refreshToken } = setTokens(user, res);
            return res.json({
                status: res.__('LoggedIn'),
                user,
                token,
                refreshToken
            });
        });
    })(req, res, next);
};