import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme reddedildi. Token bulunamadı.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mertyk_kpss_super_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token.' });
  }
};
