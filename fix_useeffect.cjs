const fs = require('fs');
let pay = fs.readFileSync('src/pages/Pay.jsx', 'utf8');

pay = pay.replace(
  "import React, { useMemo, useState } from 'react';",
  "import React, { useMemo, useState, useEffect } from 'react';"
);

fs.writeFileSync('src/pages/Pay.jsx', pay);
