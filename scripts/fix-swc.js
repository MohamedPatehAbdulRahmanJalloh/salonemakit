const fs = require('fs');
const path = require('path');

// On systems where isMusl() incorrectly returns true (glibc with musl ldd),
// SWC looks for the musl .node binary but can't dlopen it.
// Copy the gnu binary to where the musl one is expected.
const swcDir = path.join(__dirname, '..', 'node_modules', '@swc', 'core');
const gnuBin = path.join(__dirname, '..', 'node_modules', '@swc', 'core-linux-x64-gnu', 'swc.linux-x64-gnu.node');
const muslTarget = path.join(swcDir, 'swc.linux-x64-musl.node');

if (fs.existsSync(gnuBin) && !fs.existsSync(muslTarget)) {
  try {
    fs.copyFileSync(gnuBin, muslTarget);
    console.log('[fix-swc] Copied gnu binary to musl path');
  } catch (e) {
    // Non-fatal
  }
}
