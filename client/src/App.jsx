import "./App.css";
import { useRef, useState } from "react";

function ColorCard({ color, onSelectionChange }) {
  const [copied, setCopied] = useState(null);
  const [selected, setSelected] = useState(false);

  async function copyHex() {
    try {
      await navigator.clipboard.writeText(color.hex);

      setCopied("hex");

      setTimeout(() => {
        setCopied(null);
      }, 1000);
    } catch (err) {
      console.error("HEX copy failed:", err);
    }
  }

  async function copyRgb() {
    try {
      await navigator.clipboard.writeText(color.rgb);

      setCopied("rgb");

      setTimeout(() => {
        setCopied(null);
      }, 1000);
    } catch (err) {
      console.error("RGB copy failed:", err);
    }
  }

  return (
    <div
  className={`color-card ${
    selected ? "color-card-selected" : ""
  }`}
>

      {/* UPPER HALF — HEX */}
      <div
        className="color-preview"
        style={{
          backgroundColor: color.hex,
        }}
        onClick={copyHex}
      >
        <div className="hex-selection">
  <span className="hex-code">
    {color.hex}
  </span>

  {selected && (
    <span className="selected-badge">
      ✓ Selected
    </span>
  )}


  <input
    type="checkbox"
    checked={selected}
    onChange={(e) => {
  e.stopPropagation();

  const isChecked = e.target.checked;

  if (onSelectionChange) {
    const accepted = onSelectionChange(color, isChecked);

    if (accepted === false) {
      setSelected(false);
      return;
    }
  }

  setSelected(isChecked);
}}
    onClick={(e) => e.stopPropagation()}
  />
</div>

        {copied === "hex" && (
          <div className="copied copied-hex">
            ✓ HEX Code Copied!
          </div>
        )}
      </div>


      {/* BOTTOM HALF — RGB */}
      <div
        className="color-info"
        onClick={copyRgb}
      >
        <div className="color-row">

          <span>{color.rgb}</span>

          <div className="usage">
            Usage: {color.usage ?? 0}%
          </div>

        </div>

        {copied === "rgb" && (
          <div className="copied copied-rgb">
            ✓ RGB Code Copied!
          </div>
        )}
      </div>

    </div>
  );
}

function ColorSection({ title, colors, onSelectionChange }) {
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <section className="section">
      <h2>{title}</h2>

      <div className="cards">
        {colors.map((color) => (
          <ColorCard
  key={`${title}-${color.hex}`}
  color={color}
  onSelectionChange={onSelectionChange}
/>
        ))}
      </div>
    </section>
  );
}

function getReadableTextColor(hex) {
  if (!hex) return "#000000";

  const value = hex.replace("#", "");

  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);

  const brightness =
    (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 160
    ? "#000000"
    : "#FFFFFF";
}

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
const abortControllerRef = useRef(null);
const fullScanAbortControllerRef = useRef(null);


  const [selectedColors, setSelectedColors] = useState(
  Array(6).fill(null)
);
const [activeThemeSlot, setActiveThemeSlot] = useState(null);

const [text1Color, setText1Color] = useState("#000000");
const [text2Color, setText2Color] = useState("#44546A");
const [background1Color, setBackground1Color] = useState("#FFFFFF");
const [background2Color, setBackground2Color] = useState("#E7E6E6");

const [generatingPpt, setGeneratingPpt] = useState(false);
  const [showFullWebsiteColors, setShowFullWebsiteColors] = useState(false);
  const [fullWebsiteResult, setFullWebsiteResult] = useState(null);
  const [fullWebsiteScanning, setFullWebsiteScanning] = useState(false);
  

  const defaultAccentColors = [
  "#4472C4",
  "#ED7D31",
  "#A5A5A5",
  "#FFC000",
  "#5B9BD5",
  "#70AD47",
];

const defaultTextColors = [
  "#000000",
  "#44546A",
];

const defaultBackgroundColors = [
  "#FFFFFF",
  "#E7E6E6",
];

const currentTheme = {
  accents: selectedColors.map(
    (color, index) =>
      color || defaultAccentColors[index]
  ),

  text: [
    text1Color,
    text2Color,
  ],

  background: [
    background1Color,
    background2Color,
  ],
};

function handleColorSelection(color, isChecked) {

  // ==========================================
  // ASSIGN COLOUR TO ACTIVE ACCENT SLOT
  // ==========================================

  if (
    activeThemeSlot &&
    activeThemeSlot.startsWith("accent")
  ) {

    const accentNumber = Number(
      activeThemeSlot.replace("accent", "")
    );

    const accentIndex = accentNumber - 1;

    if (
      accentIndex >= 0 &&
      accentIndex < 6
    ) {

      if (isChecked) {

        setSelectedColors((prev) => {
          const updated = [...prev];

          updated[accentIndex] = color.hex;

          return updated;
        });

      } else {

        setSelectedColors((prev) => {
          const updated = [...prev];

          if (updated[accentIndex] === color.hex) {
            updated[accentIndex] = null;
          }

          return updated;
        });

      }

      return true;
    }
  }

  // ==========================================
  // ASSIGN COLOUR TO TEXT 1
  // ==========================================

  if (activeThemeSlot === "text1") {

    if (isChecked) {

      setText1Color(color.hex);

    } else {

      setText1Color("#000000");

    }

    return true;
  }

  // ==========================================
  // ASSIGN COLOUR TO TEXT 2
  // ==========================================

  if (activeThemeSlot === "text2") {

    if (isChecked) {

      setText2Color(color.hex);

    } else {

      setText2Color("#44546A");

    }

    return true;
  }

// ==========================================
  // ASSIGN COLOUR TO BACKGROUND 1
  // ==========================================

  if (activeThemeSlot === "background1") {

    if (isChecked) {

      setBackground1Color(color.hex);

    } else {

      setBackground1Color("#FFFFFF");

    }

    return true;
  }

 // ==========================================
  // ASSIGN COLOUR TO BACKGROUND 2
  // ==========================================

  if (activeThemeSlot === "background2") {

    if (isChecked) {

      setBackground2Color(color.hex);

    } else {

      setBackground2Color("#E7E6E6");

    }

    return true;
  }

  // ==========================================
  // EXISTING COLOUR SELECTION LOGIC
  // ==========================================

  if (isChecked) {

    const emptyIndex = selectedColors.findIndex(
      (hex) => hex === null
    );

    if (emptyIndex === -1) {
      alert(
        "You can select a maximum of 6 colours for the PPT theme."
      );

      return false;
    }

    setSelectedColors((prev) => {
      const updated = [...prev];

      updated[emptyIndex] = color.hex;

      return updated;
    });

    return true;
  }


  const colorIndex = selectedColors.findIndex(
    (hex) => hex === color.hex
  );

  if (colorIndex !== -1) {

    setSelectedColors((prev) => {
      const updated = [...prev];

      updated[colorIndex] = null;

      return updated;
    });

  }

  return true;
}

async function generatePptThemeFile() {
  
  try {
    setGeneratingPpt(true);

    const response = await fetch("/api/generate-theme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  theme: currentTheme,
}),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.error || "Unable to generate PowerPoint theme."
      );
    }

    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "Brand-Theme.pptx";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error("PPT generation error:", err);

    alert(
      err.message ||
        "Unable to generate PowerPoint theme."
    );
  } finally {
    setGeneratingPpt(false);
  }
}

  async function scanWebsite() {
    if (loading) return;

    let website = url.trim();

    if (!website) {
      alert("Enter Website Address");
      return;
    }

    // Add https:// if protocol is missing
    if (
      !website.startsWith("http://") &&
      !website.startsWith("https://")
    ) {
      website = "https://" + website;
    }

    // Validate URL
    try {
      const parsed = new URL(website);

      if (
        parsed.protocol !== "https:" &&
        parsed.protocol !== "http:"
      ) {
        throw new Error();
      }
    } catch {
      alert("Please enter a valid webpage URL.");
      return;
    }

    // Create a new controller for this analysis
    const controller = new AbortController();

    abortControllerRef.current = controller;

    try {
      setLoading(true);

      // ==========================================
      // CURRENT PAGE SCAN
      // ==========================================

      const response = await fetch("/api/scan", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          url: website,
        }),

        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Scan failed"
        );
      }

      console.log("SCAN RESULT:", data);

      setResult(data);


            
    } catch (err) {

      if (err.name === "AbortError") {
        console.log(
          "Website analysis stopped by user."
        );
        return;
      }

      console.error(
        "Scan error:",
        err
      );

      alert(
        err.message ||
          "Unable to analyze website."
      );

    } finally {

      abortControllerRef.current = null;

      setLoading(false);
    
    } 
   
      }

async function scanFullWebsite() {
  if (!result || fullWebsiteScanning) return;

  const website = url.trim();

  const controller = new AbortController();

  fullScanAbortControllerRef.current = controller;

  try {
    setFullWebsiteScanning(true);

    const response = await fetch(
      "/api/scan-full-test",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          url: website,
        }),

        signal: controller.signal,
      }
    );

    const fullData =
      await response.json();

    if (!response.ok) {
      throw new Error(
        fullData.error ||
          "Full website scan failed"
      );
    }

    console.log(
      "FULL WEBSITE SCAN RESULT:",
      fullData
    );

    setFullWebsiteResult(fullData);

  } catch (err) {

    if (err.name === "AbortError") {
      console.log(
        "Full website scan stopped by user."
      );
      return;
    }

    console.error(
      "Full website scan error:",
      err
    );

  } finally {

    fullScanAbortControllerRef.current = null;

    setFullWebsiteScanning(false);
  }
}
function stopFullWebsiteScan() {
  if (fullScanAbortControllerRef.current) {
    fullScanAbortControllerRef.current.abort();
    fullScanAbortControllerRef.current = null;
  }

  setFullWebsiteScanning(false);
}
  function stopAnalyzing() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setLoading(false);
    setFullWebsiteScanning(false);
  }

  function resetApp() {
  // Stop current page scan
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }

  // Stop full website scan
  if (fullScanAbortControllerRef.current) {
    fullScanAbortControllerRef.current.abort();
    fullScanAbortControllerRef.current = null;
  }

  // Reset all application data
  setUrl("");
setResult(null);
setFullWebsiteResult(null);
setShowFullWebsiteColors(false);
setFullWebsiteScanning(false);
setLoading(false);
setGeneratingPpt(false);
setActiveThemeSlot(null);

  // Clear selected PPT colours
  setSelectedColors(Array(6).fill(null));
  setText1Color("#000000");
setText2Color("#44546A");
setBackground1Color("#FFFFFF");
setBackground2Color("#E7E6E6");
}

  return (
  

    <div className="app">

      {/* =========================
          HERO
      ========================= */}

      <header className="hero">
        <div className="hero-content">

          <h1>
            Brand Theme Finder
          </h1>

          <p>
            Extract accurate colours from any webpage
          </p>

        </div>
      </header>


      {/* =========================
          MAIN
      ========================= */}

      <main className="container">

        {/* =========================
            SEARCH
        ========================= */}

        <div className="search-card">

          <label>
            Enter Website Address
          </label>

          <div className="search-box">

            <input
              type="text"
              value={url}
              placeholder="https://www.example.com"
              onChange={(e) =>
                setUrl(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  scanWebsite();
                }
              }}
            />

            <button
  className={`analyze-button ${
    loading ? "loading stop-button" : ""
  }`}
  onClick={
    loading
      ? stopAnalyzing
      : scanWebsite
  }
  disabled={false}
>

  {loading ? (
    <>
      <span className="spinner"></span>
      Stop Analyzing
    </>
  ) : (
    "Analyze"
  )}

</button>

          </div>


<div className="search-options-row">

  <div className="search-options-left">

    <div className="disclaimer">
      * Displays colours extracted only from
      the current web page.
    </div>

    <div className="more-colors-option">
      <label>

        <input
          type="checkbox"
          checked={showFullWebsiteColors}
          disabled={!result || fullWebsiteScanning}
          onChange={(e) => {
            const checked = e.target.checked;

            setShowFullWebsiteColors(checked);

            if (checked) {
              scanFullWebsite();
            } else {
              if (fullScanAbortControllerRef.current) {
                fullScanAbortControllerRef.current.abort();
                fullScanAbortControllerRef.current = null;
              }

              setFullWebsiteScanning(false);
            }
          }}
        />

        I need more colours from this website

      </label>
    </div>

  </div>

  <button
    type="button"
    className="reset-button"
    onClick={resetApp}
  >
    ↻ Reset
  </button>

</div>

          
          {fullWebsiteScanning && (
  <div className="full-website-status">

    <span className="scanning-spinner"></span>

    <span>
      Scanning website for more colours...
    </span>

    <button
      type="button"
      className="stop-full-scan-button"
      onClick={stopFullWebsiteScan}
    >
      Stop Scanning
    </button>

  </div>
)}

        </div>


        {/* =========================
            RESULTS
        ========================= */}

        {result && (
          <>

            {/* Website title */}

           {showFullWebsiteColors &&
  fullWebsiteResult &&
  !fullWebsiteScanning && (
    
<div className="result-header">

  <span>
    Colours extracted from{" "}
  </span>

  <a
    href={
      fullWebsiteResult.webpage
        ? new URL(fullWebsiteResult.webpage).origin + "/"
        : "#"
    }
    target="_blank"
    rel="noopener noreferrer"
  >
    {fullWebsiteResult.webpage
      ? new URL(fullWebsiteResult.webpage).origin + "/"
      : "Unknown"}
  </a>

</div>

)}

<div className="current-theme">
  <h3>Customize the theme colours by selecting from the cards below</h3>

  <div className="theme-preview-row">

  {/* =========================
      ACCENT COLOURS
  ========================= */}
  <div className="theme-preview-group">

    {/* Accent 1 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("accent1")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "accent1"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor:
            selectedColors[0] || defaultAccentColors[0],
        }}
      >
        <span>
          {selectedColors[0] || defaultAccentColors[0]}
        </span>
      </div>

      <div className="theme-color-label">
        Accent 1
      </div>
    </div>


    {/* Accent 2 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("accent2")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "accent2"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor:
            selectedColors[1] || defaultAccentColors[1],
        }}
      >
        <span>
          {selectedColors[1] || defaultAccentColors[1]}
        </span>
      </div>

      <div className="theme-color-label">
        Accent 2
      </div>
    </div>


    {/* Accent 3 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("accent3")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "accent3"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor:
            selectedColors[2] || defaultAccentColors[2],
        }}
      >
        <span>
          {selectedColors[2] || defaultAccentColors[2]}
        </span>
      </div>

      <div className="theme-color-label">
        Accent 3
      </div>
    </div>


    {/* Accent 4 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("accent4")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "accent4"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor:
            selectedColors[3] || defaultAccentColors[3],
        }}
      >
        <span>
          {selectedColors[3] || defaultAccentColors[3]}
        </span>
      </div>

      <div className="theme-color-label">
        Accent 4
      </div>
    </div>


    {/* Accent 5 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("accent5")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "accent5"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor:
            selectedColors[4] || defaultAccentColors[4],
        }}
      >
        <span>
          {selectedColors[4] || defaultAccentColors[4]}
        </span>
      </div>

      <div className="theme-color-label">
        Accent 5
      </div>
    </div>


    {/* Accent 6 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("accent6")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "accent6"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor:
            selectedColors[5] || defaultAccentColors[5],
        }}
      >
        <span>
          {selectedColors[5] || defaultAccentColors[5]}
        </span>
      </div>

      <div className="theme-color-label">
        Accent 6
      </div>
    </div>

  </div>


  {/* =========================
      TEXT COLOURS
  ========================= */}
  <div className="theme-preview-group">

    {/* Text 1 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("text1")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "text1"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor: text1Color,
        }}
      >
        <span>
          {text1Color}
        </span>
      </div>

      <div className="theme-color-label">
        Text 1
      </div>
    </div>


    {/* Text 2 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("text2")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "text2"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor: text2Color,
        }}
      >
        <span>
          {text2Color}
        </span>
      </div>

      <div className="theme-color-label">
        Text 2
      </div>
    </div>

  </div>


  {/* =========================
      BACKGROUND COLOURS
  ========================= */}
  <div className="theme-preview-group">

    {/* Background 1 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("background1")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "background1"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor: background1Color,
        }}
      >
        <span style={{ color: getReadableTextColor(background1Color) }}>
          {background1Color}
        </span>
      </div>

      <div className="theme-color-label">
        Background 1
      </div>
    </div>


    {/* Background 2 */}
    <div
      className="theme-color-box"
      onClick={() => setActiveThemeSlot("background2")}
      style={{
        cursor: "pointer",
        outline:
          activeThemeSlot === "background2"
            ? "2px solid #4472C4"
            : "none",
        outlineOffset: "3px",
      }}
    >
      <div
        className="theme-color-swatch"
        style={{
          backgroundColor: background2Color,
        }}
      >
        <span style={{ color: getReadableTextColor(background2Color) }}>
          {background2Color}
        </span>
      </div>

      <div className="theme-color-label">
        Background 2
      </div>
    </div>

<div className="ppt-theme-action">
  <button
    className="generate-ppt-button"
    onClick={generatePptThemeFile}
    disabled={
      selectedColors.length === 0 ||
      generatingPpt
    }
  >
    {generatingPpt
      ? "Generating PPT Theme..."
      : "Generate PPT Theme"}
  </button>
</div>

  </div>

</div>

</div>

            {/* =========================
                BACKGROUND COLOURS
            ========================= */}

            <ColorSection
  title="Background Colours"
  colors={
    showFullWebsiteColors && fullWebsiteResult
      ? fullWebsiteResult.backgroundColors
      : result.backgroundColors
  }
  onSelectionChange={handleColorSelection}
/>


            {/* =========================
                TEXT COLOURS
            ========================= */}

           <ColorSection
  title="Text Colours"
  colors={result.textColors}
  onSelectionChange={handleColorSelection}
/>

          </>
        )}

      </main>

    </div>
  );
}

export default App;
