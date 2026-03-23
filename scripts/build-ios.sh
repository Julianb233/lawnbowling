#!/bin/bash
# build-ios.sh — Build and submit LawnBowl iOS app to App Store Connect
# Run this on macOS with Xcode installed.
#
# Prerequisites:
#   1. Apple Developer account ($99/year) enrolled at https://developer.apple.com
#   2. Xcode installed with command-line tools
#   3. Signed into Xcode with your Apple Developer account
#   4. Update TEAM_ID in ios/ExportOptions.plist with your Apple Team ID
#
# Usage:
#   ./scripts/build-ios.sh          # Full build + upload
#   ./scripts/build-ios.sh sync     # Only sync web assets
#   ./scripts/build-ios.sh archive  # Only archive (skip upload)

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKSPACE="$PROJECT_ROOT/ios/App/App.xcworkspace"
PROJECT="$PROJECT_ROOT/ios/App/App.xcodeproj"
SCHEME="App"
ARCHIVE_PATH="$PROJECT_ROOT/ios/build/LawnBowl.xcarchive"
EXPORT_PATH="$PROJECT_ROOT/ios/build/export"
EXPORT_OPTIONS="$PROJECT_ROOT/ios/ExportOptions.plist"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[iOS Build]${NC} $1"; }
warn() { echo -e "${YELLOW}[Warning]${NC} $1"; }
err() { echo -e "${RED}[Error]${NC} $1"; exit 1; }

# Check prerequisites
check_prerequisites() {
  log "Checking prerequisites..."

  if [[ "$(uname)" != "Darwin" ]]; then
    err "This script must be run on macOS"
  fi

  if ! command -v xcodebuild &>/dev/null; then
    err "Xcode command-line tools not found. Install with: xcode-select --install"
  fi

  if ! command -v npx &>/dev/null; then
    err "Node.js/npx not found. Install Node.js first."
  fi

  if grep -q "TEAM_ID_HERE" "$EXPORT_OPTIONS"; then
    err "Update TEAM_ID in ios/ExportOptions.plist with your Apple Developer Team ID.
    Find it at: https://developer.apple.com/account → Membership Details"
  fi

  log "Prerequisites OK"
}

# Sync Capacitor web assets to iOS project
sync_assets() {
  log "Syncing Capacitor assets to iOS..."
  cd "$PROJECT_ROOT"
  npm install
  npx cap sync ios
  log "Capacitor sync complete"
}

# Build archive
build_archive() {
  log "Building iOS archive..."
  mkdir -p "$(dirname "$ARCHIVE_PATH")"

  xcodebuild archive \
    -project "$PROJECT" \
    -scheme "$SCHEME" \
    -destination "generic/platform=iOS" \
    -archivePath "$ARCHIVE_PATH" \
    CODE_SIGN_STYLE=Automatic \
    -allowProvisioningUpdates \
    | tail -20

  if [ ! -d "$ARCHIVE_PATH" ]; then
    err "Archive failed — no .xcarchive produced"
  fi

  log "Archive created at: $ARCHIVE_PATH"
}

# Export and upload to App Store Connect
export_and_upload() {
  log "Exporting and uploading to App Store Connect..."
  mkdir -p "$EXPORT_PATH"

  xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS" \
    -exportPath "$EXPORT_PATH" \
    -allowProvisioningUpdates \
    | tail -20

  log "Upload complete! Check App Store Connect for status."
  log "https://appstoreconnect.apple.com"
}

# Main
main() {
  local cmd="${1:-all}"

  check_prerequisites

  case "$cmd" in
    sync)
      sync_assets
      ;;
    archive)
      sync_assets
      build_archive
      ;;
    all)
      sync_assets
      build_archive
      export_and_upload
      log ""
      log "=== BUILD COMPLETE ==="
      log "Next steps:"
      log "  1. Go to https://appstoreconnect.apple.com"
      log "  2. Select 'LawnBowl - Club Bowls Manager'"
      log "  3. Fill in App Store metadata (see .planning/app-store-metadata.md)"
      log "  4. Add screenshots (6.7\" iPhone + 12.9\" iPad)"
      log "  5. Submit for review"
      ;;
    *)
      echo "Usage: $0 [sync|archive|all]"
      exit 1
      ;;
  esac
}

main "$@"
