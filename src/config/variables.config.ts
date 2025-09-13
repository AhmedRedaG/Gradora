export default () => ({
  auth: {
    path: '/auth',
    login: {
      maxAttempts: 10,
      maxErrorMessage: 'reset your password',
    },
    reset: {
      maxAttempts: 10,
      maxErrorMessage: 'try again later',
    },
  },

  verification: {
    maxAttempts: 10,
    coolDown: 1000 * 60 * 15, // 15m
    maxCoolDown: 1000 * 60 * 60 * 24, // 24h
  },

  otp: {
    min: 10_000_000,
    max: 99_999_999,
    expiresInMS: 1000 * 60 * 5, // 5 minutes
    maxAttempts: 10,
    coolDown: 1000 * 60 * 15, // 15m
    maxCoolDown: 1000 * 60 * 60 * 24, // 24h
  },

  client: { baseUrl: 'http://localhost:8080' },

  company: { name: 'Gradora' },

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
      expiresInMS:
        process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN || 7 * 24 * 60 * 60 * 1000, // 7d
    },
    verification: {
      secret: process.env.VERIFICATION_TOKEN_SECRET,
      expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN || '15m',
    },
  },

  email: {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: process.env.SMTP_PORT || 587,
    smtpSecure: false,
    serverEmail: process.env.SERVER_MAIL,
    serverEmailPass: process.env.SERVER_MAIL_PASS,
    supportEmail: process.env.SUPPORT_MAIL || process.env.SERVER_MAIL,
  },
});
