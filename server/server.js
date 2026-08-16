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
    const { colors } = req.body;

    if (!Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({
        error: "Please select at least one colour."
      });
    }

    if (colors.length > 6) {
      return res.status(400).json({
        error: "You can select a maximum of 6 colours."
      });
    }

    const outputPath = require("path").join(
      __dirname,
      "Brand-Theme.pptx"
    );

    await generatePptTheme(colors, outputPath);

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