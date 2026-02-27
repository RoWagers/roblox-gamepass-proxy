// Roblox Gamepass Proxy (Vercel Serverless Function)
// Optimized for 2026 Roblox API

export default async function handler(req, res) {
  try {
    const { userId } = req.query;

    // Validate input early
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: "Invalid or missing userId"
      });
    }

    let allPasses = [];
    let cursor = null;

    // Roblox paginates results, so we must loop
    do {
      const url =
        `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?limit=100` +
        (cursor ? `&cursor=${cursor}` : "");

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Roblox API failed: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data.gamePasses)) {
        allPasses.push(...data.gamePasses);
      }

      cursor = data.nextPageCursor;

    } while (cursor);

    // Clean and optimize response
    const formatted = allPasses.map(pass => ({
      id: pass.gamePassId,
      name: pass.name,
      price: pass.price ?? null,
      forSale: pass.price != null,
      icon:
        pass.iconAssetId
          ? `https://thumbnails.roblox.com/v1/assets?assetIds=${pass.iconAssetId}&size=150x150&format=Png`
          : null,
      creatorId: pass.creator?.creatorId ?? null,
      creatorName: pass.creator?.name ?? null
    }));

    return res.status(200).json(formatted);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
