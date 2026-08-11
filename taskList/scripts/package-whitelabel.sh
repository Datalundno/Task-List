#!/usr/bin/env bash
# Build the unbranded Task List .pbiviz from branded source + whitelabel overlays.
set -euo pipefail
export ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export BUILD="$ROOT/.tmp/whitelabel-build"
WL="$ROOT/whitelabel"

rm -rf "$BUILD"
mkdir -p "$BUILD"

for item in src style assets capabilities.json tsconfig.json eslint.config.mjs package-lock.json; do
  cp -a "$ROOT/$item" "$BUILD/$item"
done

cp "$WL/pbiviz.json" "$BUILD/pbiviz.json"
mkdir -p "$BUILD/stringResources/en-US"
cp "$WL/resources.resjson" "$BUILD/stringResources/en-US/resources.resjson"

node <<'NODE'
const fs = require("fs");
const path = require("path");
const root = process.env.ROOT;
const build = process.env.BUILD;
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const over = JSON.parse(fs.readFileSync(path.join(root, "whitelabel/package.partial.json"), "utf8"));
Object.assign(pkg, over);
fs.writeFileSync(path.join(build, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
NODE

python3 <<'PY'
from pathlib import Path
import os
build = Path(os.environ["BUILD"])
visual = build / "src" / "visual.ts"
text = visual.read_text()
text = text.replace(
    'Landing_Title", "DataLund Task List"',
    'Landing_Title", "Task List"',
)
text = text.replace(
    'aria-label", "DataLund Task List"',
    'aria-label", "Task List"',
)
visual.write_text(text)
(build / "LICENSE").write_text(
"""MIT License

Copyright (c) 2026 Task List contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
""")
PY

cd "$BUILD"
if [[ -d "$ROOT/node_modules" ]]; then
  ln -sfn "$ROOT/node_modules" "$BUILD/node_modules"
else
  npm install
fi

npx pbiviz package
GUID_PKG=$(ls dist/*.pbiviz | head -1)
mkdir -p "$ROOT/downloads"
cp "$GUID_PKG" "$ROOT/downloads/TaskList.pbiviz"
echo "Wrote $ROOT/downloads/TaskList.pbiviz ($(basename "$GUID_PKG"))"
echo "Note: unbranded package is gitignored — do not commit it next to the branded visual."
ls -la "$ROOT/downloads/TaskList.pbiviz"
