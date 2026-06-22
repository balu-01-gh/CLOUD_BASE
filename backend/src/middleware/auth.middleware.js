const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  try {
    let token = '';
    const header = req.headers.authorization || '';
    const [scheme, tokenFromHeader] = header.split(' ');
    
    if (scheme === 'Bearer' && tokenFromHeader) {
      token = tokenFromHeader;
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch (_err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { requireAuth };

