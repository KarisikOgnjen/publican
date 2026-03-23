#!/bin/bash
      INPUT=$(cat)
      FILE=$(echo "$INPUT" | python3 -c "
      import sys, json
      try:
          d = json.load(sys.stdin)
          print(d.get('tool_input', {}).get('file_path', ''))
      except:
          print('')
      " 2>/dev/null)
      
      [ -z "$FILE" ] && exit 0
      
      
      exit 0
      