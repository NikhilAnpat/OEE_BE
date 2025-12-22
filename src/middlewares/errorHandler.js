function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Prisma unique constraint errors etc will end up here.
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    // keep server logs for debugging
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
