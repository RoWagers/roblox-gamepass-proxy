export default async function handler(req, res) {

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {

    let universeIds = [];
    let cursor = null;

    // STEP 1: get ALL universes owned by the user
    do {

      const url =
        `https://games.roblox.com/v2/users/${userId}/games?limit=50` +
        (cursor ? `&cursor=${cursor}` : "");

      const response = await fetch(url);

      if (!response.ok)
        throw new Error("Failed to fetch user games");

      const json = await response.json();

      for (const game of json.data) {
        universeIds.push(game.id);
      }

      cursor = json.nextPageCursor;

    } while (cursor);



    // STEP 2: fetch passes from each universe
    let passes = [];

    for (const universeId of universeIds) {

      let passCursor = null;

      do {

        const url =
          `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100` +
          (passCursor ? `&cursor=${passCursor}` : "");

        const response = await fetch(url);

        if (!response.ok)
          break;

        const json = await response.json();

        if (json.data) {

          for (const pass of json.data) {

            // only include passes that are actually for sale
            if (pass.price != null) {

              passes.push({
                id: pass.id,
                name: pass.name,
                price: pass.price
              });

            }

          }

        }

        passCursor = json.nextPageCursor;

      } while (passCursor);

    }


    res.status(200).json(passes);

  }
  catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

}
