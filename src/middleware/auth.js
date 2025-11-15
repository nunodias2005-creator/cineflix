import jwt from 'jsonwebtoken';
export default function requireAuth(roleRequired='user') {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'no token' });
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = payload;
      if (roleRequired === 'admin' && payload.role !== 'admin') {
        return res.status(403).json({ error: 'forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'invalid token' });
    }
  };
}
