const PptxGenJS = require("pptxgenjs");
const JSZip = require("jszip");
const fs = require("fs");

async function generatePptTheme(colors, outputPath) {
  if (!Array.isArray(colors) || colors.length === 0) {
    throw new Error("At least one color is required.");
  }

  const selectedColors = colors
    .slice(0, 6)
    .map((color) => color.replace("#", "").toUpperCase());

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

  const accentNames = [
    "accent1",
    "accent2",
    "accent3",
    "accent4",
    "accent5",
    "accent6",
  ];

  selectedColors.forEach((color, index) => {
    const accentName = accentNames[index];

    const regex = new RegExp(
      `(<a:${accentName}>\\s*<a:)(srgbClr|sysClr)([^>]*)(?:\\/>|>.*?<\\/a:(?:srgbClr|sysClr)>)`,
      "s"
    );

    const replacement =
      `<a:${accentName}><a:srgbClr val="${color}"/></a:${accentName}>`;

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