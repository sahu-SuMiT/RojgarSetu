const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('=== authMiddleware called ===');
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  
  const authHeader = req.headers.authorization;
  let token = null;

  // Check Authorization header first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('Token from Authorization header:', token ? 'Found' : 'Not found');
  }
  
  // Fallback to cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Token from cookies:', token ? 'Found' : 'Not found');
  }

  if (!token) {
    console.log('No token found in either place');
    return res.status(401).json({ message: 'Unauthorized: Please login or provide a valid token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    // More flexible user ID extraction
    const userId = decoded.id || decoded._id || decoded.userId || decoded.user?.id;
    const userEmail = decoded.email || decoded.user?.email;
    const userName = decoded.name || decoded.user?.name;
    
    if (!userId) {
      console.log('No user ID found in token:', decoded);
      return res.status(401).json({ message: 'Unauthorized: Token payload missing user id.' });
    }
    
    req.user = { 
      id: userId, 
      email: userEmail, 
      name: userName,
      type: decoded.type,
      role: decoded.role
    };
    
    console.log('User set in request:', req.user);
    next();
  } catch (err) {
    console.error('Token verification error in authMiddleware:', err);
    res.status(401).json({ message: 'Unauthorized: Token is not valid.' });
  }
};
