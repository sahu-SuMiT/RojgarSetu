const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Check session-based authentication
  if (req.session && req.session.user && req.session.user.id) {
    return next();
  }

  // Check JWT token-based authentication
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Please login or provide a valid token.' });
  }

  try {

    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Token is not valid.' });
  }
};
