const puppeteer = require("puppeteer");

let browser = null;

async function getBrowser() {
    if (!browser) {
        console.log(">>> Starting Chromium <<<");

        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        });

        console.log(">>> Chromium started <<<");
    }

    return browser;
}

async function getSameDomainLinks(page, url, maxPages = 40) {
    const baseUrl = new URL(url);

    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a[href]"))
            .map(link => link.href)
            .filter(Boolean);
    });

    const uniqueLinks = [];

    for (const link of links) {
        try {
            const parsed = new URL(link);

            // Same website/domain only
            if (parsed.hostname !== baseUrl.hostname) {
                continue;
            }

            // Only HTTP/HTTPS pages
            if (
                parsed.protocol !== "http:" &&
                parsed.protocol !== "https:"
            ) {
                continue;
            }

            // Remove #section from URLs
            parsed.hash = "";

            const cleanUrl = parsed.toString();

            if (!uniqueLinks.includes(cleanUrl)) {
                uniqueLinks.push(cleanUrl);
            }

            if (uniqueLinks.length >= maxPages) {
                break;
            }

        } catch {
            // Ignore invalid URLs
        }
    }

    return uniqueLinks;
}

async function scanFullWebsite(url, maxPages = 40) {

    console.log(">>> Starting full website scan <<<");

    const browserInstance = await getBrowser();

    // Temporary page only for finding website links
    const linkPage = await browserInstance.newPage();

    try {

        await linkPage.setRequestInterception(true);

        linkPage.on("request", request => {

            const resourceType = request.resourceType();

            if (
                resourceType === "image" ||
                resourceType === "media" ||
                resourceType === "font"
            ) {
                request.abort();
            } else {
                request.continue();
            }

        });

        await linkPage.setViewport({
            width: 1440,
            height: 900
        });

        await linkPage.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 20000
        });

        await new Promise(resolve =>
            setTimeout(resolve, 300)
        );

        const links = await getSameDomainLinks(
            linkPage,
            url,
            maxPages
        );

        console.log(
            "Full website pages to scan:",
            links.length
        );

        const allTextColors = [];
        const allBackgroundColors = [];

        for (let i = 0; i < links.length; i++) {

            const pageUrl = links[i];

            console.log(
                `>>> Scanning page ${i + 1}/${links.length}: ${pageUrl}`
            );

            try {

                const result = await scanWebsite(pageUrl);

                allTextColors.push(
                    ...result.computedColors.textColors
                );

                allBackgroundColors.push(
                    ...result.computedColors.backgroundColors
                );

            } catch (error) {

                console.error(
                    "Page scan failed:",
                    pageUrl,
                    error.message
                );

            }

        }

        console.log(
            ">>> Full website scan completed <<<"
        );

        console.log(
            "Total text colours collected:",
            allTextColors.length
        );

        console.log(
            "Total background colours collected:",
            allBackgroundColors.length
        );

        return {
            pagesScanned: links.length,
            textColors: allTextColors,
            backgroundColors: allBackgroundColors
        };

    } finally {

        await linkPage.close();

    }
}

async function scanWebsite(url) {

    console.log(">>> Opening website <<<");

    const browserInstance = await getBrowser();

    const page = await browserInstance.newPage();

    try {

        // ==========================================
        // BLOCK UNNECESSARY RESOURCES
        // ==========================================

        await page.setRequestInterception(true);

        page.on("request", request => {

            const resourceType = request.resourceType();

            if (
                resourceType === "image" ||
                resourceType === "media" ||
                resourceType === "font"
            ) {
                request.abort();
            } else {
                request.continue();
            }

        });

        // ==========================================
        // VIEWPORT
        // ==========================================

        await page.setViewport({
            width: 1440,
            height: 900
        });

        // ==========================================
        // LOAD WEBSITE
        // ==========================================

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 20000
        });

        // Small rendering buffer
        await new Promise(resolve =>
            setTimeout(resolve, 300)
        );

        console.log(">>> Website loaded <<<");

        // ==========================================
        // WEBSITE TITLE
        // ==========================================

        const title = await page.title();
   
        // ==========================================
        // EXTRACT COLOURS
        // ==========================================

        const computedColors = await page.evaluate(() => {

            const textColors = [];
            const backgroundColors = [];
            const cssColors = [];

            // --------------------------------------
            // Convert CSS RGB/RGBA to RGB
            // --------------------------------------

            function normalize(color) {

                if (!color) return null;

                const match = color.match(/\d+/g);

                if (!match || match.length < 3) {
                    return null;
                }

                return `rgb(${match[0]},${match[1]},${match[2]})`;
            }

function normalizeCssColor(color) {

    if (!color) return null;

    color = color.trim();

    // HEX colours
    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
        return color.toUpperCase();
    }

    if (/^#[0-9a-fA-F]{3}$/.test(color)) {
        return color
            .split("")
            .map((char, index) => {
                if (index === 0) return char;
                return char + char;
            })
            .join("")
            .toUpperCase();
    }

    // RGB / RGBA colours
    const match = color.match(/\d+/g);

    if (match && match.length >= 3) {
        return `rgb(${match[0]},${match[1]},${match[2]})`;
    }

    return null;
}

            // --------------------------------------
            // Ignore transparent colours
            // --------------------------------------

            function transparent(color) {

                return (
                    !color ||
                    color === "transparent" ||
                    color === "rgba(0, 0, 0, 0)"
                );

            }

            function extractCssColors(cssText) {

    if (!cssText) return;

    const matches = cssText.match(
        /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g
    );

    if (matches) {

        matches.forEach(color => {
            cssColors.push(color);
        });

    }

}
// ==================================
// SCAN CSS STYLESHEETS
// ==================================

Array.from(document.styleSheets).forEach(sheet => {

    try {

        Array.from(sheet.cssRules || []).forEach(rule => {

            if (rule.cssText) {
                extractCssColors(rule.cssText);
            }

        });

    } catch (error) {

        // Cross-origin stylesheet
        // may not allow cssRules access
        console.log(
            "Stylesheet access skipped:",
            sheet.href
        );

    }

});


// ==========================================
// CSS VARIABLE COLOURS
// ==========================================

document.querySelectorAll("*").forEach(element => {

    const style = window.getComputedStyle(element);

    for (let i = 0; i < style.length; i++) {

        const propertyName = style[i];

        if (!propertyName.startsWith("--")) {
            continue;
        }

        const value = style.getPropertyValue(propertyName).trim();

        const normalized = normalizeCssColor(value);

        if (normalized) {
            cssColors.push(normalized);
        }
    }
});

            // --------------------------------------
            // Scan visible elements
            // --------------------------------------

            document.querySelectorAll("*").forEach(element => {

                const style =
                    window.getComputedStyle(element);

                const rect =
                    element.getBoundingClientRect();

                // Ignore invisible elements
                if (
                    rect.width <= 0 ||
                    rect.height <= 0 ||
                    style.display === "none" ||
                    style.visibility === "hidden"
                ) {
                    return;
                }

                const tag =
                    element.tagName.toLowerCase();

                // Ignore non-visual / non-text elements
                if (
                    tag === "script" ||
                    tag === "style" ||
                    tag === "meta" ||
                    tag === "link" ||
                    tag === "svg" ||
                    tag === "path" ||
                    tag === "img" ||
                    tag === "video" ||
                    tag === "canvas"
                ) {
                    return;
                }

                // ==================================
                // TEXT COLOURS
                // ==================================

                const hasText =
                    Array.from(element.childNodes).some(node => {

                        return (
                            node.nodeType === Node.TEXT_NODE &&
                            node.textContent.trim().length > 0
                        );

                    });

                if (hasText) {

                    const textColor =
                        normalize(style.color);

                    if (
                        textColor &&
                        !transparent(style.color)
                    ) {

                        textColors.push(textColor);

                    }

                }

                // ==================================
                // BACKGROUND COLOURS
                // ==================================

                const backgroundColor =
                    normalize(style.backgroundColor);

                if (
                    backgroundColor &&
                    !transparent(style.backgroundColor)
                ) {

                    backgroundColors.push(backgroundColor);

                }

            });

// ==========================================
// DIAGNOSTIC — SCOTIA GREEN
// ==========================================

const scotiaGreenMatches = [];

document.querySelectorAll("*").forEach(element => {

    const style = window.getComputedStyle(element);

    const values = [
        style.color,
        style.backgroundColor,
        style.borderColor,
        style.borderTopColor,
        style.borderRightColor,
        style.borderBottomColor,
        style.borderLeftColor
    ];

    if (
        values.some(value =>
            value &&
            (
                value.includes("19, 132, 104") ||
                value.includes("19,132,104")
            )
        )
    ) {

        scotiaGreenMatches.push({
            tag: element.tagName,
            className: element.className,
            id: element.id,
            color: style.color,
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor
        });

    }

});

console.log(
    ">>> SCOTIA GREEN MATCHES <<<",
    scotiaGreenMatches
);

            return {
    textColors,
    backgroundColors,
    cssColors
};
console.log(
    "CSS Variable Colours:",
    computedColors.cssColors.length
);
        });

        console.log(
            "Rendered Text Colours:",
            computedColors.textColors.length
        );

        console.log(
            "Rendered Background Colours:",
            computedColors.backgroundColors.length
        );

console.log(
    "CSS Colours:",
    computedColors.cssColors.length
);

        // ==========================================
        // RETURN RESULT
        // ==========================================

        return {
            title,
            computedColors
        };

    } finally {

        // IMPORTANT:
        // Close only the page.
        // Chromium stays alive for the next scan.

        await page.close();

    }

}

// ==============================================
// OPTIONAL: CLOSE BROWSER WHEN SERVER STOPS
// ==============================================

async function closeBrowser() {

    if (browser) {

        console.log(">>> Closing Chromium <<<");

        await browser.close();

        browser = null;

    }

}

process.on("SIGINT", async () => {

    await closeBrowser();

    process.exit(0);

});

process.on("SIGTERM", async () => {

    await closeBrowser();

    process.exit(0);

});

module.exports = scanWebsite;
module.exports.scanFullWebsite = scanFullWebsite;