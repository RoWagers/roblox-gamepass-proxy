export default async function handler(req, res) {

    const { userId } = req.query;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({
            error: "Invalid or missing userId"
        });
    }

    try {

        //--------------------------------------------------
        // STEP 1: GET ALL USER UNIVERSES (with pagination)
        //--------------------------------------------------

        let universes = [];
        let cursor = null;

        do {

            const url =
                `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50&sortOrder=Asc`
                + (cursor ? `&cursor=${cursor}` : "");

            const response = await fetch(url);

            if (!response.ok)
                throw new Error("Failed to fetch games");

            const json = await response.json();

            if (json.data)
                universes.push(...json.data);

            cursor = json.nextPageCursor;

        } while (cursor);


        //--------------------------------------------------
        // STEP 2: FETCH GAMEPASSES FROM ALL UNIVERSES
        //--------------------------------------------------

        const passFetchPromises = universes.map(async (game) => {

            let passes = [];
            let pageToken = null;

            do {

                const url =
                    `https://apis.roblox.com/game-passes/v1/universes/${game.id}/game-passes`
                    + `?passView=Full&pageSize=100`
                    + (pageToken ? `&pageToken=${pageToken}` : "");

                const response = await fetch(url);

                if (!response.ok)
                    break;

                const json = await response.json();

                if (json.data) {

                    for (const pass of json.data) {

                        if (
                            pass.price &&
                            pass.price > 0 &&
                            pass.creator?.id == userId
                        ) {

                            passes.push({
                                id: pass.id,
                                price: pass.price,
                                name: pass.name,
                                universeId: game.id,
                                iconImageAssetId: pass.iconImageAssetId
                            });

                        }

                    }

                }

                pageToken = json.nextPageToken;

            } while (pageToken);

            return passes;

        });


        //--------------------------------------------------
        // STEP 3: WAIT FOR ALL REQUESTS
        //--------------------------------------------------

        const results = await Promise.all(passFetchPromises);

        //--------------------------------------------------
        // STEP 4: FLATTEN ARRAY
        //--------------------------------------------------

        const allPasses = results.flat();

        //--------------------------------------------------
        // STEP 5: SORT BY PRICE (LOW → HIGH)
        //--------------------------------------------------

        allPasses.sort((a, b) => a.price - b.price);


        //--------------------------------------------------
        // RETURN RESULT
        //--------------------------------------------------

        return res.status(200).json(allPasses);

    }
    catch (err) {

        return res.status(500).json({
            error: err.message
        });

    }

}
