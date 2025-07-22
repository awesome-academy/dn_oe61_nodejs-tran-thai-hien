export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
