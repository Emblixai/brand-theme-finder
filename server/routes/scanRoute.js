const express = require("express");
const tinycolor = require("tinycolor2");

const router = express.Router();

const scanWebsite = require("../services/websiteScanner");


// ======================================================
// REMOVE DUPLICATES + CALCULATE USAGE
// ======================================================

function processColors(colors) {

    const counts = {};

    colors.forEach(color => {

        if (!color) return;

        const tc = tinycolor(color);

        if (!tc.isValid()) return;

        const hex =
            tc.toHexString().toUpperCase();

        counts[hex] =
            (counts[hex] || 0) + 1;

    });

    const total =
        Object.values(counts)
            .reduce((sum, count) => sum + count, 0);

    if (total === 0) {
        return [];
    }

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([hex, frequency]) => {

            const tc = tinycolor(hex);

            return {
                hex,
                rgb: tc.toRgbString(),
                usage: Number(
                    ((frequency / total) * 100).toFixed(2)
                ),
                frequency
            };

        });

}


// ======================================================
// SCAN
// ======================================================

router.post("/scan-full-test", async (req, res) => {

    try {

        let { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: "Webpage URL required"
            });
        }

        if (!url.startsWith("http")) {
            url = "https://" + url;
        }

        console.log("================================");
        console.log("FULL WEBSITE TEST SCAN");
        console.log("URL:", url);
        console.log("================================");

        const result =
            await scanWebsite.scanFullWebsite(url, 10);

        const backgroundColors =
            processColors(result.backgroundColors);

        const textColors =
            processColors(result.textColors);

        console.log(
            "Pages scanned:",
            result.pagesScanned
        );

        console.log(
            "Full website background colours:",
            backgroundColors.length
        );

        console.log(
            "Full website text colours:",
            textColors.length
        );

        res.json({
            success: true,
            webpage: url,
            pagesScanned: result.pagesScanned,
            backgroundColors,
            textColors
        });

    } catch (error) {

        console.error(
            "FULL WEBSITE TEST ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

router.post("/scan", async (req, res) => {

    try {

        let { url } = req.body;

        if (!url) {

            return res.status(400).json({
                success: false,
                error: "Webpage URL required"
            });

        }

        if (!url.startsWith("http")) {
            url = "https://" + url;
        }

        console.log("================================");
        console.log("SCAN REQUEST");
        console.log("URL:", url);
        console.log("================================");

        // Scan webpage
        const website =
            await scanWebsite(url);

        // Process Background Colours
        const backgroundColors =
            processColors(
                website.computedColors.backgroundColors
            );

        // Process Text Colours
        const textColors =
            processColors(
                website.computedColors.textColors
            );

        console.log(
            "Background Colours:",
            backgroundColors.length
        );

        console.log(
            "Text Colours:",
            textColors.length
        );

        console.log("================================");
        console.log("SCAN COMPLETED");
        console.log("================================");

        res.json({

            success: true,

            title:
                website.title ||
                "Website Analysis",

            webpage: url,

            backgroundColors,

            textColors

        });

    }

    catch (error) {

        console.error(
            "SCAN ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            error: error.message

        });

    }

});


module.exports = router;