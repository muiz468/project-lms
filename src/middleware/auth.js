// Minimal "auth": role comes from a header. No real auth per assignment scope.
function requireRole(role) {
  return (req, res, next) => {
    const userRole = req.header('X-Role');
    if (userRole !== role) {
      return res.status(403).json({ error: `Requires role: ${role}` });
    }
    next();
  };
}

module.exports = { requireRole };