import { useEffect, useMemo, useState } from "react";
import {
  MoreVertical,
  X,
  Save,
  Plus,
  Play,
  RotateCcw,
  Download,
  Trash2,
  Clock3,
} from "lucide-react";

const DEFAULT_CODE = `// XAU/USD Indicator
// TradeX Script

function strategy(data) {
  const price = data.close;

  // Example strategy
  if (price > data.open) {
    return "BUY";
  }

  if (price < data.open) {
    return "SELL";
  }

  return "WAIT";
}
`;

const DEFAULT_SCRIPTS = [
  {
    id: 1,
    name: "UNTITLED INDICATOR",
    code: DEFAULT_CODE,
  },
];

function ScriptEditor() {
  const [scripts, setScripts] = useState(() => {
    try {
      const saved = localStorage.getItem("tradex_scripts");

      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Script storage error:", error);
    }

    return DEFAULT_SCRIPTS;
  });

  const [selectedId, setSelectedId] = useState(1);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [saved, setSaved] = useState(false);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    localStorage.setItem(
      "tradex_scripts",
      JSON.stringify(scripts),
    );
  }, [scripts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const selectedScript = useMemo(
    () => scripts.find((item) => item.id === selectedId),
    [scripts, selectedId],
  );

  useEffect(() => {
    if (selectedScript) {
      setCode(selectedScript.code);
    }
  }, [selectedId]);

  const indiaTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(time);

  const londonTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(time);

  const newYorkTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(time);

  const utcTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(time);

  const handleSelectScript = (script) => {
    setSelectedId(script.id);
    setCode(script.code);
    setOutput("");
    setSaved(false);
  };

  const handleSave = () => {
    setScripts((current) =>
      current.map((script) =>
        script.id === selectedId
          ? {
              ...script,
              code,
            }
          : script,
      ),
    );

    setSaved(true);

    setOutput("Script saved successfully.");

    setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  const handleNewScript = () => {
    const newId = Date.now();

    const newScript = {
      id: newId,
      name: "UNTITLED INDICATOR",
      code: DEFAULT_CODE,
    };

    setScripts((current) => [...current, newScript]);

    setSelectedId(newId);
    setCode(DEFAULT_CODE);
    setOutput("New script created.");
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    setOutput("Editor reset to default template.");
  };

  const handleDelete = () => {
    if (scripts.length <= 1) {
      setOutput("At least one script must remain.");
      return;
    }

    const remaining = scripts.filter(
      (script) => script.id !== selectedId,
    );

    setScripts(remaining);

    setSelectedId(remaining[0].id);
    setCode(remaining[0].code);

    setOutput("Script deleted.");
  };

  const handleRun = () => {
    const hasFunction = /function\s+strategy\s*\(/.test(code);
    const hasOpeningBrace = code.includes("{");
    const hasClosingBrace = code.includes("}");

    if (!hasFunction) {
      setOutput(
        "Error: strategy(data) function was not found.",
      );
      return;
    }

    if (!hasOpeningBrace || !hasClosingBrace) {
      setOutput(
        "Error: Code braces are incomplete.",
      );
      return;
    }

    setOutput(
      "✓ Script validated successfully.\n✓ Strategy function detected.\n✓ Ready for chart analysis.",
    );
  };

  const handleDownload = () => {
    const blob = new Blob([code], {
      type: "text/javascript",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${selectedScript?.name || "indicator"}.js`;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);

    setOutput("Script exported.");
  };

  const lines = code.split("\n");

  return (
    <section className="script-editor-panel">
      {/* =====================================
          SCRIPT HEADER
      ===================================== */}

      <div className="script-editor-header">
        <div className="script-title">
          <span>
            {selectedScript?.name || "UNTITLED INDICATOR"}
          </span>
        </div>

        <div className="script-header-actions">
          <button
            type="button"
            title="New script"
            onClick={handleNewScript}
          >
            <Plus size={18} />
          </button>

          <button
            type="button"
            title="More"
          >
            <MoreVertical size={18} />
          </button>

          <button
            type="button"
            title="Close editor"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      {/* =====================================
          CLOCKS
      ===================================== */}

      <div className="script-clocks">
        <div className="script-clock">
          <span>IST</span>
          <strong>{indiaTime}</strong>
        </div>

        <div className="script-clock">
          <span>LON</span>
          <strong>{londonTime}</strong>
        </div>

        <div className="script-clock">
          <span>NY</span>
          <strong>{newYorkTime}</strong>
        </div>

        <div className="script-clock">
          <span>UTC</span>
          <strong>{utcTime}</strong>
        </div>
      </div>

      {/* =====================================
          SCRIPT LIST
      ===================================== */}

      {scripts.length > 1 && (
        <div className="script-file-list">
          {scripts.map((script) => (
            <button
              key={script.id}
              type="button"
              className={
                selectedId === script.id
                  ? "script-file active"
                  : "script-file"
              }
              onClick={() =>
                handleSelectScript(script)
              }
            >
              <span className="script-file-dot" />

              <span>
                {script.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* =====================================
          EDITOR
      ===================================== */}

      <div className="script-code-wrapper">
        <div className="script-line-numbers">
          {lines.map((_, index) => (
            <span key={index}>
              {index + 1}
            </span>
          ))}
        </div>

        <textarea
          className="script-code-editor"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setSaved(false);
          }}
          spellCheck="false"
          wrap="off"
          aria-label="Script editor"
        />
      </div>

      {/* =====================================
          OUTPUT
      ===================================== */}

      {output && (
        <div className="script-output">
          <div className="script-output-title">
            <span>OUTPUT</span>

            <button
              type="button"
              onClick={() => setOutput("")}
            >
              <X size={13} />
            </button>
          </div>

          <pre>{output}</pre>
        </div>
      )}

      {/* =====================================
          FOOTER
      ===================================== */}

      <div className="script-editor-footer">
        <div className="script-powered">
          <span>⚡ Powered by</span>
          <a href="#indie">Indie</a>
        </div>

        <div className="script-footer-actions">
          <button
            type="button"
            onClick={handleRun}
            title="Validate script"
          >
            <Play size={15} />
            <span>Run</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            title="Save script"
          >
            <Save size={15} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Reset"
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Export"
          >
            <Download size={15} />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Delete"
            className="script-delete-button"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ScriptEditor;