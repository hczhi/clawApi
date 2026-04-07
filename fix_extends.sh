#!/bin/bash
for file in public/app/scss/pages/*.scss; do
    sed -i '' 's/@extend \.text-4xl;/font-size: 2.25rem; line-height: 2.5rem;/g' "$file"
    sed -i '' 's/@extend \.text-5xl;/font-size: 3rem; line-height: 1;/g' "$file"
    sed -i '' 's/@extend \.text-6xl;/font-size: 3.75rem; line-height: 1;/g' "$file"
    sed -i '' 's/@extend \.truncate;/overflow: hidden; text-overflow: ellipsis; white-space: nowrap;/g' "$file"
done
