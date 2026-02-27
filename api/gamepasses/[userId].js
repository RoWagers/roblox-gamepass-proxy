// Roblox Gamepass Proxy — Final Optimized Version (2026)

export default async function handler(req, res) {
  try {
    const { userId } = req.query;

    // Validate input
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: "Invalid or missing userId"
      });
    }

    // Use the correct modern endpoint
    const url =
      `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?count=100`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Roblox API failed (${response.status})`
      });
    }

    const data = await response.json();

    if (!data.gamePasses) {
      return res.status(200).json([]);
    }

    // Clean output
    const passes = data.gamePasses.map(pass => ({
      id: pass.gamePassId,
      name: pass.name,
      description: pass.description || "",
      price: pass.price,
      forSale: pass.isForSale,
      iconAssetId: pass.iconAssetId,
      thumbnail:
        `https://thumbnails.roblox.com/v1/assets?assetIds=${pass.iconAssetId}&size=150x150&format=Png`,
      creatorType: pass.creator?.creatorType,
      creatorId: pass.creator?.creatorId,
      creatorName: pass.creator?.name
    }));

    return res.status(200).json(passes);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
