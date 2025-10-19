#!/bin/bash
# Script to remove ! prefixes from Tailwind classes in all TSX files

echo "🔧 Removing ! prefixes from Tailwind classes..."

# Find all .tsx and .ts files and remove ! from className attributes
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
  if grep -q "className.*!" "$file"; then
    echo "Processing: $file"
    # Use sed to remove ! from className strings
    # This handles both single and double quotes
    sed -i '' 's/className="\([^"]*\)"/className="\1"/g' "$file" | sed -i '' 's/!/\ /g' "$file"
    sed -i '' "s/className='\([^']*\)'/className='\1'/g" "$file"
  fi
done

echo "✅ Done! All ! prefixes removed."

