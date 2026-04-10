const fs = require('fs');
let f = 'bank-frontend/src/pages/dashboard/admin/CreateBranchModal.jsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/\\\`/g, '`');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync(f, c);