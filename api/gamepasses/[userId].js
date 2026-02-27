export default async function handler(req, res) {
  try {
    const { userId } = req.query;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: "Invalid or missing userId"
      });
    }

    let allPasses = [];
    let cursor = null;

    do {
      const url =
        `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?count=100` +
        (cursor ? `&cursor=${cursor}` : "");

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Roblox API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.gamePasses) break;

      allPasses.push(...data.gamePasses);

      cursor = data.nextPageCursor;

    } while (cursor);

    return res.status(200).json(allPasses);

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
