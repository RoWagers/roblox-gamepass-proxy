export default async function handler(req, res) {

  const { userId } = req.query;

  if (!userId)
    return res.status(400).json({ error: "Missing userId" });

  try {

    let passes = [];
    let lastId = "";

    while (true) {

      const url =
        `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?count=100` +
        (lastId ? `&exclusiveStartId=${lastId}` : "");

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok)
        throw new Error("Roblox API failed: " + response.status);

      const json = await response.json();

      if (!json.data || json.data.length === 0)
        break;

      for (const pass of json.data) {

        if (pass.priceInRobux != null) {

          passes.push({
            id: pass.id,
            name: pass.name,
            price: pass.priceInRobux
          });

        }

      }

      lastId = json.data[json.data.length - 1].id;

      if (json.data.length < 100)
        break;

    }

    res.status(200).json(passes);

  }
  catch (err) {

    res.status(500).json({
      error: err.toString()
    });

  }

}
