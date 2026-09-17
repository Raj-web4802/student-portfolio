const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required. Use Bearer <token>.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token has expired.' : 'Invalid authentication token.';
    res.status(401).json({ error: message });
  }
}

module.exports = { requireAuth };
