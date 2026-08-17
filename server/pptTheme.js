const PptxGenJS = require("pptxgenjs");
const JSZip = require("jszip");
const fs = require("fs");

async function generatePptTheme(theme, outputPath) {
  if (!theme || typeof theme !== "object") {
    throw new Error("A valid theme is required.");
  }

  const accents = Array.isArray(theme.accents)
    ? theme.accents.slice(0, 6)
    : [];

  const text = Array.isArray(theme.text)
    ? theme.text.slice(0, 2)
    : [];

  const background = Array.isArray(theme.background)
    ? theme.background.slice(0, 2)
    : [];

  if (
    accents.length !== 6 ||
    text.length !== 2 ||
    background.length !== 2
  ) {
    throw new Error("Complete theme colours are required.");
  }

  const cleanColor = (color) =>
    String(color)
      .replace("#", "")
      .toUpperCase();

  const selectedColors = {
    accent1: cleanColor(accents[0]),
    accent2: cleanColor(accents[1]),
    accent3: cleanColor(accents[2]),
    accent4: cleanColor(accents[3]),
    accent5: cleanColor(accents[4]),
    accent6: cleanColor(accents[5]),

    text1: cleanColor(text[0]),
    text2: cleanColor(text[1]),

    background1: cleanColor(background[0]),
    background2: cleanColor(background[1]),
  };

  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE";

  pptx.author = "Brand Theme Finder";
  pptx.title = "Brand Theme";
  pptx.subject = "Brand colour theme";

  // Create a normal PowerPoint presentation first.
  const tempPath = `${outputPath}.tmp.pptx`;

  const slide = pptx.addSlide();

  // Keep the generated presentation visually neutral.
  slide.background = {
    color: "FFFFFF",
  };

  await pptx.writeFile({
    fileName: tempPath,
  });

  // Open the generated PPTX because it is a ZIP package.
  const fileBuffer = fs.readFileSync(tempPath);
  const zip = await JSZip.loadAsync(fileBuffer);

  const themeFile = zip.file("ppt/theme/theme1.xml");

  if (!themeFile) {
    throw new Error("PowerPoint theme file was not found.");
  }

  let themeXml = await themeFile.async("string");

  const themeColors = {
    dk1: selectedColors.text1,
    lt1: selectedColors.background1,
    dk2: selectedColors.text2,
    lt2: selectedColors.background2,

    accent1: selectedColors.accent1,
    accent2: selectedColors.accent2,
    accent3: selectedColors.accent3,
    accent4: selectedColors.accent4,
    accent5: selectedColors.accent5,
    accent6: selectedColors.accent6,
  };

  Object.entries(themeColors).forEach(([name, color]) => {
    const regex = new RegExp(
      `(<a:${name}>\\s*<a:)(srgbClr|sysClr)([^>]*)(?:\\/>|>.*?<\\/a:(?:srgbClr|sysClr)>)`,
      "s"
    );

    const replacement =
      `<a:${name}><a:srgbClr val="${color}"/></a:${name}>`;

    themeXml = themeXml.replace(regex, replacement);
  });

  zip.file("ppt/theme/theme1.xml", themeXml);

  const finalBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  fs.writeFileSync(outputPath, finalBuffer);

  // Remove temporary PPTX.
  fs.unlinkSync(tempPath);
}

module.exports = {
  generatePptTheme,
};