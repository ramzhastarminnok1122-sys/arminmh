const fs = require('fs');
let em = fs.readFileSync('src/pages/Emergency.jsx', 'utf8');

em = em.replace(
  "import { cn, normPhone, toFa, uid, reqCode, addrError, declError, aiCheckLocation, aiCheckVehicle, BRAND_GROUPS, VEHICLE_DB } from '../lib/utils';",
  "import { cn, normPhone, toFa, uid, reqCode, addrError, declError, aiCheckLocation, aiCheckVehicle, BRAND_GROUPS, VEHICLE_DB, getBestTech } from '../lib/utils';"
);

fs.writeFileSync('src/pages/Emergency.jsx', em);
