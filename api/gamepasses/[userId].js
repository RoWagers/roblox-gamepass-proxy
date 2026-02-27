export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ error: "Missing userId" });
    return;
  }

  try {
    const response = await fetch(
      `https://games.roblox.com/v2/users/${userId}/game-passes?limit=100&sortOrder=Asc`
    );

    const data = await response.json();

    const passes = data.data.map(pass => ({
      id: pass.id,
      price: pass.price
    }));

    res.status(200).json(passes);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
