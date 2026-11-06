const fs = require('fs');

let layout = fs.readFileSync('src/components/SiteLayout.jsx', 'utf8');
layout = layout.replace(
  "function SpeedDial({ phone, onMenu }) {",
  "function SpeedDial({ phone, onMenu }) {\n  const { state } = useStore();"
);

fs.writeFileSync('src/components/SiteLayout.jsx', layout);
