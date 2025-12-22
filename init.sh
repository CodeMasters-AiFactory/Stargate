#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# STARGATE PORTAL - OVERNIGHT AGENT INITIALIZATION SCRIPT (Unix)
# ═══════════════════════════════════════════════════════════════════════════════
# Based on Anthropic's research: "Effective harnesses for long-running agents"
# https://www.anthropic.com/research/long-running-agents
# ═══════════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════════"
echo "  STARGATE PORTAL - OVERNIGHT AGENT HARNESS v1.0"
echo "  Merlin 8.0 Industry DNA Expansion Mission"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"
echo "[OK] Working directory: $(pwd)"

# Check Node.js
echo "[..] Checking Node.js..."
NODE_VERSION=$(node --version)
echo "[OK] Node.js: $NODE_VERSION"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "[..] Installing dependencies..."
    npm install
fi
echo "[OK] Dependencies ready"

# Start development server in background
echo "[..] Starting development server..."
npm run dev &
SERVER_PID=$!
sleep 10

# Test if server is running
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "[OK] Server running at http://localhost:5000"
else
    echo "[WARN] Server may still be starting..."
fi

# Display progress status
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  CURRENT PROGRESS STATUS"
echo "═══════════════════════════════════════════════════════════════════"

# Read and display feature status
if [ -f "feature_list.json" ]; then
    TOTAL=$(jq '.industries | length' feature_list.json)
    COMPLETED=$(jq '[.industries[] | select(.passes == true)] | length' feature_list.json)
    REMAINING=$((TOTAL - COMPLETED))
    
    echo "Total Industries: $TOTAL"
    echo "Completed: $COMPLETED"
    echo "Remaining: $REMAINING"
    echo ""
    
    echo "Next industries to implement:"
    jq -r '.industries[] | select(.passes == false) | "  - \(.id): \(.name)"' feature_list.json | head -5
fi

# Display recent git activity
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  RECENT GIT COMMITS"
echo "═══════════════════════════════════════════════════════════════════"
git log --oneline -5

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  READY FOR OVERNIGHT AGENT WORK"
echo "  Read claude-progress.txt and feature_list.json to continue"
echo "═══════════════════════════════════════════════════════════════════"
