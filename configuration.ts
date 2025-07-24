export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
    verifyEmailExpiresIn: process.env.JWT_VERIFY_EMAIL_EXPIRES_IN,
    forgotPasswordExpiresIn: process.env.JWT_FORGOT_PASSWORD_EXPIRES_IN,
  },
  app: {
    url: process.env.APP_URL,
    name: process.env.APP_NAME,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },
});
