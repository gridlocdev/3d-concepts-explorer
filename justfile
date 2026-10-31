port := "5180"

# List recipes
default:
    @just --list

# Serve src/ at http://localhost:5180/ while developing (no build step)
serve port=port:
    python3 tools/serve.py {{port}} src

# Build dist/: the files to upload to a web server
build:
    rm -rf dist
    cp -R src dist
    rm dist/index-old.html
    @echo "Built dist/ ($(find dist -type f | wc -l | tr -d ' ') files)"

# Build, then serve dist/ to check it before deploying
preview port=port: build
    python3 tools/serve.py {{port}} dist

# Re-vendor three.js at a version (e.g. `just vendor-three 0.182.0`)
vendor-three version:
    curl -fsSL -o src/vendor/three/three.module.min.js https://cdn.jsdelivr.net/npm/three@{{version}}/build/three.module.min.js
    curl -fsSL -o src/vendor/three/three.core.min.js https://cdn.jsdelivr.net/npm/three@{{version}}/build/three.core.min.js
    curl -fsSL -o src/vendor/three/LICENSE https://cdn.jsdelivr.net/npm/three@{{version}}/LICENSE
    echo {{version}} > src/vendor/three/VERSION
