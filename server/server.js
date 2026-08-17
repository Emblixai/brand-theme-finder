const express = require("express");
const cors = require("cors");
const { generatePptTheme } = require("./pptTheme");

const scanRoute = require("./routes/scanRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Brand Theme Finder API is running"
    });
});

app.use("/api", scanRoute);

app.post("/api/generate-theme", async (req, res) => {
  try {
    const { theme } = req.body;

    if (!theme || typeof theme !== "object") {
  return res.status(400).json({
    error: "A valid theme is required."
  });
}

if (
  !Array.isArray(theme.accents) ||
  theme.accents.length !== 6 ||
  !Array.isArray(theme.text) ||
  theme.text.length !== 2 ||
  !Array.isArray(theme.background) ||
  theme.background.length !== 2
) {
  return res.status(400).json({
    error: "Complete theme colours are required."
  });
}

    const outputPath = require("path").join(
      __dirname,
      "Brand-Theme.pptx"
    );

    await generatePptTheme(theme, outputPath);

    res.download(
      outputPath,
      "Brand-Theme.pptx",
      (err) => {
        if (err) {
          console.error("PPT download error:", err);
        }
      }
    );

  } catch (err) {
    console.error("PPT generation error:", err);

    res.status(500).json({
      error: "Unable to generate PowerPoint theme."
    });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});