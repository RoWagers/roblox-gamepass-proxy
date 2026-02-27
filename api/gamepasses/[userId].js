export default async function handler(req, res) {

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({
            error: "Missing userId"
        });
    }

    try {

        const response = await fetch(
            `https://games.roblox.com/v1/users/${userId}/game-passes?limit=100&sortOrder=Asc`
        );

        const json = await response.json();

        if (!json.data) {
            return res.status(200).json([]);
        }

        const passes = json.data.map(pass => ({
            id: pass.id,
            price: pass.price,
            name: pass.name
        }));

        return res.status(200).json(passes);

    } catch (err) {

        return res.status(500).json({
            error: err.toString()
        });

    }

}
