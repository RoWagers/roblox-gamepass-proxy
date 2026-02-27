export default async function handler(req, res) {

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {

    let universeIds = [];
    let cursor = "";

    // STEP 1: get all experiences owned by user
    do {

      const gamesRes = await fetch(
        `https://games.roblox.com/v2/users/${userId}/games?limit=50&cursor=${cursor}`
      );

      if (!gamesRes.ok) {
        throw new Error("Failed to fetch user games");
      }

      const gamesJson = await gamesRes.json();

      for (const game of gamesJson.data) {
        universeIds.push(game.id);
      }

      cursor = gamesJson.nextPageCursor;

    } while (cursor);


    // STEP 2: get passes from each universe
    let passes = [];

    for (const universeId of universeIds) {

      let passCursor = "";

      do {

        const passRes = await fetch(
          `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100&cursor=${passCursor}`
        );

        if (!passRes.ok) break;

        const passJson = await passRes.json();

        for (const pass of passJson.data) {

          passes.push({
            id: pass.id,
            name: pass.name,
            price: pass.price,
            universeId: universeId
          });

        }

        passCursor = passJson.nextPageCursor;

      } while (passCursor);

    }

    res.status(200).json(passes);

  }
  catch (err) {

    res.status(500).json({
      error: err.toString()
    });

  }

}
