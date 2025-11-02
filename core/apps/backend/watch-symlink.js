const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, 'dist/core/apps/backend/src/main.js');
const link = path.resolve(__dirname, 'dist/main.js');

function createSymlink() {
  if (fs.existsSync(target)) {
    try {
      if (fs.existsSync(link)) fs.unlinkSync(link);
      fs.symlinkSync(path.relative(path.dirname(link), target), link, 'file');
      console.log('[Symlink] Created dist/main.js -> core/apps/backend/src/main.js');
    } catch (err) {
      // Ignore
    }
  }
}

chokidar.watch(target).on('add', createSymlink).on('change', createSymlink);
console.log('[Symlink Watcher] Watching for dist/core/apps/backend/src/main.js');
