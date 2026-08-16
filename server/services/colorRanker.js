const tinycolor = require("tinycolor2");

function normalizeColor(color) {
    const tc = tinycolor(color);

    if (!tc.isValid()) {
        return null;
    }

    return tc.toHexString().toUpperCase();
}

function rankColors(colors = []) {

    // ============================================
    // 1. NORMALIZE + COUNT UNIQUE COLORS
    // ============================================

    const frequency = {};

    colors.forEach(color => {

        const hex = normalizeColor(color);

        if (!hex) {
            return;
        }

        frequency[hex] = (frequency[hex] || 0) + 1;

    });

    // ============================================
    // 2. CREATE UNIQUE COLOR LIST
    // ============================================

    const uniqueColors = Object.entries(frequency)
        .map(([color, count]) => ({
            color,
            frequency: count
        }));

    // ============================================
    // 3. TOTAL FREQUENCY
    // ============================================

    const totalFrequency = uniqueColors.reduce(
        (sum, item) => sum + item.frequency,
        0
    );

    // ============================================
    // 4. ADD USAGE %
    // ============================================

    uniqueColors.forEach(item => {

        item.usage = totalFrequency
            ? Number(
                ((item.frequency / totalFrequency) * 100)
                    .toFixed(2)
            )
            : 0;

    });

    // ============================================
    // 5. SORT BY FREQUENCY
    // ============================================

    const sorted = [...uniqueColors].sort(
        (a, b) => b.frequency - a.frequency
    );

    // ============================================
    // 6. MOST USED
    // ============================================

    const mostUsed = sorted.slice(0, 8);

    // ============================================
    // 7. LEAST USED
    //
    // IMPORTANT:
    // Don't repeat colors already shown in
    // Most Used.
    // ============================================

    const mostUsedSet = new Set(
        mostUsed.map(item => item.color)
    );

    const leastUsed = [...sorted]
        .reverse()
        .filter(item => !mostUsedSet.has(item.color))
        .slice(0, 8);

    // ============================================
    // 8. TEXT COLORS
    //
    // Prefer dark/strong colors.
    // ============================================

    const text = sorted
        .filter(item => {

            const tc = tinycolor(item.color);

            const brightness = tc.getBrightness();

            return brightness < 180;

        })
        .slice(0, 8);

    // ============================================
    // 9. BACKGROUND COLORS
    //
    // Prefer light colors.
    // ============================================

    const background = sorted
        .filter(item => {

            const tc = tinycolor(item.color);

            const brightness = tc.getBrightness();

            return brightness >= 180;

        })
        .slice(0, 8);

    // ============================================
    // DEBUG
    // ============================================

    console.log("===== COLOR RANKER =====");

    console.log(
        "Raw colors:",
        colors.length
    );

    console.log(
        "Unique colors:",
        uniqueColors.length
    );

    console.log(
        "Most used:",
        mostUsed.map(c => c.color)
    );

    console.log(
        "Least used:",
        leastUsed.map(c => c.color)
    );

    console.log("========================");

    return {
        mostUsed,
        leastUsed,
        text,
        background
    };
}

module.exports = rankColors;