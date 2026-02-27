export default async function handler(req, res) {

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {

    const response = await fetch(
      `https://inventory.roblox.com/v1/users/${userId}/items/GamePass?limit=100`
    );

    const json = await response.json();

    const passes = json.data.map(pass => ({
      id: pass.id
    }));

    res.status(200).json(passes);

  } catch {

    res.status(500).json({
      error: "Failed"
    });

  }

}
