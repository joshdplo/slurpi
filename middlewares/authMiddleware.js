export default async function authMiddleware(req, res, next) {
  // Pass auth session details to app locals for use
  res.locals.spotifyLoggedIn = req?.session?.spotifyLoggedIn || null;
  res.locals.spotifyAccessToken = req?.session?.spotifyAccessToken || null;

  next();
}