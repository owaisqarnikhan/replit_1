# BAYG - Vite Build Error Troubleshooting

## 🚨 **"Vite Not Found" Error Solutions**

If you encounter "vite not found" error during deployment, here are the solutions:

---

## **Quick Fix Commands**

### **Option 1: Manual Build (Recommended)**
```bash
# Navigate to your project directory
cd /var/www/bayg

# Install dependencies explicitly
npm install --production=false
npm install -g vite esbuild

# Build frontend
npx vite build

# Build backend
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Verify build
ls -la dist/
```

### **Option 2: Fix PATH and Build**
```bash
# Export Node.js bin path
export PATH=$PATH:/usr/local/lib/node_modules/.bin
export PATH=$PATH:./node_modules/.bin

# Verify Vite is accessible
which vite
npx vite --version

# Build normally
npm run build
```

### **Option 3: Alternative Build Script**
```bash
# Create custom build script
cat > build.sh << 'EOF'
#!/bin/bash
set -e

echo "Building BAYG application..."

# Ensure we have all dependencies
npm install

# Build frontend with Vite
echo "Building frontend..."
if command -v vite >/dev/null 2>&1; then
    vite build
elif [ -f "node_modules/.bin/vite" ]; then
    ./node_modules/.bin/vite build
else
    npx vite build
fi

# Build backend with esbuild
echo "Building backend..."
if command -v esbuild >/dev/null 2>&1; then
    esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
elif [ -f "node_modules/.bin/esbuild" ]; then
    ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
else
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
fi

echo "Build completed successfully!"
ls -la dist/
EOF

# Make executable and run
chmod +x build.sh
./build.sh
```

---

## **Root Cause Analysis**

### **Common Causes:**
1. **Missing devDependencies** in production
2. **PATH environment variable** not including node_modules/.bin
3. **npm install** running with --production flag
4. **Global vs Local installation** conflicts

### **Quick Diagnostics:**
```bash
# Check if Vite is installed
npm list vite
ls -la node_modules/.bin/vite

# Check Node.js environment
echo $PATH
which node
which npm
node --version
npm --version

# Check package.json scripts
cat package.json | grep -A 5 '"scripts"'
```

---

## **Prevention for Future Deployments**

### **Update package.json**
Add this to your package.json scripts section:
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "build:frontend": "vite build",
    "build:backend": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "build:safe": "npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
  }
}
```

### **Deployment Commands with Error Handling**
```bash
# Safe deployment build
npm run build:safe || {
    echo "Safe build failed, trying individual builds..."
    npm run build:frontend
    npm run build:backend
}
```

---

## **Working Deployment Commands**

Here's the updated deployment sequence that handles Vite issues:

```bash
# 1. Setup Node.js properly
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Verify Node.js installation
node --version
npm --version

# 3. Navigate to project and install
cd /var/www/bayg
npm install --include=dev

# 4. Build with error handling
npm run build || {
    echo "npm run build failed, trying manual build..."
    npx vite build
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
}

# 5. Verify build output
ls -la dist/
ls -la dist/public/

# 6. Continue with PM2 setup...
```

---

## **Emergency Manual Build Process**

If all automated builds fail, use this manual process:

```bash
# 1. Clean previous builds
rm -rf dist/

# 2. Build frontend manually
./node_modules/.bin/vite build

# 3. Build backend manually  
./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# 4. Verify both builds exist
ls -la dist/index.js        # Backend build
ls -la dist/public/          # Frontend build

# 5. Test the build
export DATABASE_URL="postgresql://dbuser:SecurePass123!@localhost:5432/bayg"
export NODE_ENV=production
node dist/index.js &
sleep 5
curl http://localhost:5000
```

Your BAYG application should now build successfully!