const bcrypt = require('bcryptjs');
const hash = '$2b$12$FDygcWj9SSDXKPZ.bVpm4ejM71fIWdmUN.c7PTqDPgVRcwscY1pMW';
(async () => {
  console.log('Dusun2026 match:', await bcrypt.compare('Dusun2026', hash));
  console.log('admin123 match:', await bcrypt.compare('admin123', hash));
  console.log('Dusun2026! match:', await bcrypt.compare('Dusun2026!', hash));
})();
