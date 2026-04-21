#!/bin/bash
echo "=== Running tests ==="
cd "$(dirname "$0")/../.." || exit 1

EXIT_CODE=0

echo ""
echo "--- Profile Page Frontend Tests ---"
node profile.test.js || EXIT_CODE=$?

echo ""
echo "--- Calculator Tests ---"
node calculator.test.js || EXIT_CODE=$?

echo ""
echo "--- Styles Tests ---"
node styles.test.js || EXIT_CODE=$?

echo ""
echo "--- Backend Profile API Tests ---"
node backend/profile.test.js || EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "=== All tests passed ==="
else
  echo "=== Some tests FAILED ==="
fi

exit $EXIT_CODE
