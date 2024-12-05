import SteamGame from "../db/SteamGame.js";

/**
 * Steam Page
 */
export async function pageSteam(req, res, next) {
  const steamGames = await SteamGame.findAll();

  try {
    res.render('pages/steam', {
      title: 'Steam',
      description: 'Games Data from Steam (steampowered.com)',
      steamGames
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
}