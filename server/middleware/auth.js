const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // 从请求 header 中获取 token，优先支持 'Authorization: Bearer <token>'，否则兼容 'x-auth-token'
  const token =
    req.header('Authorization')?.split(' ')[1] || req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 诊断：打印接收到的 token
    console.log('Received token:', token);
    // 验证 token（使用环境变量中定义的 JWT_SECRET，如果没有则使用默认）
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    console.log('Decoded token:', decoded);
    // 将解码后的用户信息挂载到 req.user 上，后续路由可以使用
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;