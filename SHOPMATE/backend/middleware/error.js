'use strict';
function notFound(req, res) { res.status(404).json({ message: 'API endpoint not found.' }); }
function handleErrors(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error?.code === 11000) return res.status(409).json({ message: 'This email is already registered.' });
  if (error?.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON request body.' });
  const status = Number(error.status || error.statusCode) || (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  if (status >= 500) console.error('[SHOPMATE API]', error);
  res.status(status).json({ message: status >= 500 ? 'Server error. Please try again.' : error.message });
}
module.exports = { notFound, handleErrors };
