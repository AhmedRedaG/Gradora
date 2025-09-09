export default () => ({
  bcrypt: {
    rounds: 10,
  },

  jwt: {
    access: {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    },
    refresh: {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      cookieExpiresIn:
        process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN || 7 * 24 * 60 * 60 * 1000,
    },
    verification: {
      secret: process.env.VERIFICATION_TOKEN_SECRET,
      expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN || '30d',
    },
  },
});
