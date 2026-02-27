export default async function handler(req, res) {

  const { userId } = req.query;

  if (!userId)
    return res.status(400).json({ error: "Missing userId" });

  try {

    let passes = [];
    let cursor = null;

    do {

      const url =
        `https://inventory.roblox.com/v1/users/${userId}/items/GamePass?limit=100` +
        (cursor ? `&cursor=${cursor}` : "");

      const response = await fetch(url);

      if (!response.ok)
        throw new Error("Inventory API failed");

      const json = await response.json();

      if (json.data) {

        for (const item of json.data) {

          passes.push({
            id: item.assetId,
            name: item.name
          });

        }

      }

      cursor = json.nextPageCursor;

    } while (cursor);


    // STEP 2: get price for each pass
    let final = [];

    for (const pass of passes) {

      const product =
        await fetch(
          `https://apis.roblox.com/game-passes/v1/game-passes/${pass.id}/product-info`
        );

      if (!product.ok)
        continue;

      const info = await product.json();

      if (info.PriceInRobux != null) {

        final.push({
          id: pass.id,
          name: pass.name,
          price: info.PriceInRobux
        });

      }

    }

    res.status(200).json(final);

  }
  catch (err) {

    res.status(500).json({
      error: err.toString()
    });

  }

}
