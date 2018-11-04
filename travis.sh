#!/bin/bash
# shellcheck disable=SC1091
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

#
# Travis helpers
#

function fold_start() {
  export CURRENT_FOLD_NAME="$1"
  travis_fold start "$CURRENT_FOLD_NAME"
  travis_time_start
}

function fold_end() {
  travis_time_finish
  travis_fold end "$CURRENT_FOLD_NAME"
}

#
# Install
#

fold_start "yarn-install"
yarn install
fold_end

#
# Build
#

fold_start "yarn-build"
yarn build
fold_end

#
# Test
#

fold_start "yarn-test"
yarn test
fold_end
