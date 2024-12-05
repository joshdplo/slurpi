/**
 * Spotify Page
 */
export async function pageSpotify(req, res, next) {
  try {
    res.render('pages/spotify', {
      title: 'Spotify'
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
}

/**
 * Spotify Auth Callback
 */
export async function pageSpotifyAuth(req, res) {
  res.json({ placeholder: true });
};