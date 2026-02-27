export default async function handler(req, res) {

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {

    let cursor = "";
    let passes = [];

    do {

      const url =
        `https://games.roblox.com/v1/users/${userId}/game-passes?limit=100&cursor=${cursor}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Roblox API failed");
      }

      const json = await response.json();

      for (const pass of json.data) {

        passes.push({
          id: pass.id,
          name: pass.name,
          price: pass.price,
          creatorId: pass.creator?.id,
        });

      }

      cursor = json.nextPageCursor;

    } while (cursor);

    return res.status(200).json(passes);

  }
  catch (err) {

    return res.status(500).json({
      error: err.toString()
    });

  }

}
