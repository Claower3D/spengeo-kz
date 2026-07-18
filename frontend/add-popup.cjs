const fs = require('fs');

let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// 1. Add useRef to imports
if (appJsx.includes("import { useState, useEffect } from 'react';")) {
  appJsx = appJsx.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect, useRef } from 'react';");
} else if (!appJsx.includes('useRef')) {
  console.log("Could not find react import to add useRef");
}

// 2. Add markerRefs to App component
const appCompStart = "export default function App() {";
if (appJsx.includes(appCompStart) && !appJsx.includes('const markerRefs = useRef({});')) {
  appJsx = appJsx.replace(appCompStart, appCompStart + "\n  const markerRefs = useRef({});");
} else if (appJsx.includes('function App() {') && !appJsx.includes('const markerRefs = useRef({});')) {
  appJsx = appJsx.replace('function App() {', "function App() {\n  const markerRefs = useRef({});");
}

// 3. Add ref to Marker
if (appJsx.includes('<Marker') && !appJsx.includes('markerRefs.current[proj.id] = ref')) {
  appJsx = appJsx.replace(
    /(\<Marker[\s\S]*?key=\{proj\.id\})/,
    "$1\n                        ref={(ref) => {\n                          if (ref) markerRefs.current[proj.id] = ref;\n                        }}"
  );
}

// 4. Trigger popup on list click
if (appJsx.includes('onClick={() => {') && appJsx.includes('setActiveProjectCoords(proj.coords);') && !appJsx.includes('marker.openPopup()')) {
  const replaceTarget = `onClick={() => {
                          setActiveProjectCoords(proj.coords);
                          setActiveMapZoom(13);
                        }}`;
  const newClick = `onClick={() => {
                          setActiveProjectCoords(proj.coords);
                          setActiveMapZoom(13);
                          setTimeout(() => {
                            const marker = markerRefs.current[proj.id];
                            if (marker) marker.openPopup();
                          }, 1500); // Wait for flyTo animation to finish
                        }}`;
  
  // Replace globally for project cards
  appJsx = appJsx.replace(new RegExp(replaceTarget.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&').replace(/\\s+/g, '\\s+'), 'g'), newClick);
  // Manual string replace in case regex fails
  appJsx = appJsx.split(replaceTarget).join(newClick);
}

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log("Added popup bubbles on click");
