#!/bin/bash
# PostToolUse hook — auto-check posle Write/Edit
# Claude Code prosledjuje JSON na stdin

INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except:
    print('')
" 2>/dev/null)

if [ -z "$FILE" ]; then
  exit 0
fi

# No type checker configured

exit 0
