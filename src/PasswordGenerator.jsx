import { Slider } from "@mui/material";
import React, { useState, useMemo } from "react";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/\\|~`";
const AMBIGUOUS = "Il1O0`'\"\\";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const charset = useMemo(() => {
    let s = "";
    if (useUpper) s += UPPER;
    if (useLower) s += LOWER;
    if (useDigits) s += DIGITS;
    if (useSymbols) s += SYMBOLS;
    if (excludeAmbiguous) {
      s = s
        .split("")
        .filter((c) => !AMBIGUOUS.includes(c))
        .join("");
    }
    return s;
  }, [useUpper, useLower, useDigits, useSymbols, excludeAmbiguous]);

  function secureRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  function generatePassword() {
    if (!charset || charset.length === 0) {
      setPassword("");
      return;
    }

    const pools = [];
    if (useUpper) pools.push(UPPER);
    if (useLower) pools.push(LOWER);
    if (useDigits) pools.push(DIGITS);
    if (useSymbols) pools.push(SYMBOLS);

    const pw = [];

    if (length >= pools.length) {
      for (let pool of pools) {
        let p = pool;
        if (excludeAmbiguous)
          p = p
            .split("")
            .filter((c) => !AMBIGUOUS.includes(c))
            .join("");
        pw.push(p[secureRandomInt(p.length)]);
      }
    }

    for (let i = pw.length; i < length; i++) {
      pw.push(charset[secureRandomInt(charset.length)]);
    }

    for (let i = pw.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [pw[i], pw[j]] = [pw[j], pw[i]];
    }

    const result = pw.join("");
    setPassword(result);
    setCopied(false);
  }

  function copyToClipboard() {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  function estimateEntropy() {
    const size = charset.length || 1;
    const bits = length * Math.log2(size);
    return Math.round(bits);
  }

  function strengthLabel() {
    const bits = estimateEntropy();
    if (bits < 28) return "Very Weak";
    if (bits < 45) return "Weak";
    if (bits < 60) return "Strong";
    return "Very Strong";
  }

  return (
    <div>
      <h1 className="heading">PASSWORD GENERATOR</h1>

      <div>
        <input
          readOnly
          value={password}
          placeholder="Click Generate!"
          className="passCont"
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="customize">
          <div>
            <div>
              <label>Length {length}</label>
              <input
                type="range"
                min={6}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="slider"
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "gray" }}>
                strength: {strengthLabel()}
              </label>
            </div>
          </div>

          <div className="checkboxes">
            <label className="lable">
              <input
                type="checkbox"
                checked={useUpper}
                onChange={() => setUseUpper((v) => !v)}
              />
              Uppercase (A-Z)
            </label>
            <label className="lable">
              <input
                type="checkbox"
                checked={useLower}
                onChange={() => setUseLower((v) => !v)}
              />
              Lowercase (a-z)
            </label>
            <label className="lable">
              <input
                type="checkbox"
                checked={useDigits}
                onChange={() => setUseDigits((v) => !v)}
              />
              Numbers (0-9)
            </label>
            <label className="lable">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={() => setUseSymbols((v) => !v)}
              />
              Symbols (like !@#$%)
            </label>

            <label className="lable">
              <input
                type="checkbox"
                checked={excludeAmbiguous}
                onChange={() => setExcludeAmbiguous((v) => !v)}
              />
              Remove confusing letters (like I l 1 O 0)
            </label>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div>
          <button onClick={generatePassword} className="btn2">
            Generate
          </button>
        </div>
        <div>
          <button
            onClick={copyToClipboard}
            className="btn"
            aria-label="copy password"
            title="Copy"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => {
              setPassword("");
            }}
            className="btn"
          >
            Clear
          </button>

          <a
            onClick={(e) => {
              e.preventDefault();
              if (!password) return;
              const blob = new Blob([password], {
                type: "text/plain;charset=utf-8",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `password-${Date.now()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            href="#"
            className="savebtn"
          >
            Save
          </a>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: "normal",
            color: "gray",
            width: "50%",
          }}
        >
          Note: This generator runs in your browser using Web Crypto to generate
          secure random numbers. Make sure you save your passwords in a trusted
          password manager.
        </p>
      </div>
    </div>
  );
}
