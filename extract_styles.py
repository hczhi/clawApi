import os
import re

components_dir = '/Users/czhih/Desktop/work/mywork/clawApi/public/app/js/components'
scss_pages_dir = '/Users/czhih/Desktop/work/mywork/clawApi/public/app/scss/pages'
style_scss_path = '/Users/czhih/Desktop/work/mywork/clawApi/public/app/scss/style.scss'

os.makedirs(scss_pages_dir, exist_ok=True)

style_pattern = re.compile(r'<style[^>]*>([\s\S]*?)<\/style>', re.IGNORECASE)

imports_to_add = []

for filename in os.listdir(components_dir):
    if filename.endswith('.vue'):
        filepath = os.path.join(components_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        match = style_pattern.search(content)
        if match:
            style_content = match.group(1)
            
            # Remove any @import '../scss/style.scss'; inside the style block
            style_content = re.sub(r"@import\s+['\"].*?style\.scss['\"];?", "", style_content).strip()
            
            if style_content:
                basename = filename[:-4]
                scss_filename = f"_{basename.lower()}.scss"
                scss_filepath = os.path.join(scss_pages_dir, scss_filename)
                
                with open(scss_filepath, 'w', encoding='utf-8') as sf:
                    sf.write(f"// Extracted from {filename}\n")
                    sf.write(style_content)
                
                imports_to_add.append(f"@import 'pages/{basename.lower()}';")
            
            new_content = style_pattern.sub('', content).strip() + '\n'
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

if imports_to_add:
    with open(style_scss_path, 'r', encoding='utf-8') as f:
        style_main = f.read()
    
    if '// Component Pages' not in style_main:
        with open(style_scss_path, 'a', encoding='utf-8') as f:
            f.write('\n\n// Component Pages\n')
            f.write('\n'.join(imports_to_add))
            f.write('\n')

print(f"Extracted {len(imports_to_add)} SCSS blocks.")
