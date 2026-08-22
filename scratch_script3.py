import os
import re

filepath = "components/public-record/PublicProofRecord.tsx"

if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Convert Mono/uppercase section headers to elegant sans-serif
    content = re.sub(r'text-\[10px\] font-mono tracking-\[0\.1em\] text-\[#8e928f\] uppercase', 'text-[14px] font-sans font-medium text-[#8e928f]', content)
    content = re.sub(r'text-\[11px\] font-mono tracking-\[0\.1em\] uppercase', 'text-[13px] font-sans font-medium', content)
    content = re.sub(r'text-\[10px\] font-mono uppercase tracking-\[0\.15em\]', 'text-[13px] font-sans font-medium', content)
    content = re.sub(r'text-\[9px\] font-mono uppercase tracking-\[0\.1em\]', 'text-[13px] font-sans font-medium', content)
    content = re.sub(r'text-\[9px\] font-mono uppercase tracking-\[0\.15em\]', 'text-[13px] font-sans font-medium', content)

    # Some of the verification log items
    content = content.replace('Verification Log', 'Verification log')
    content = content.replace('Assertion Meta', 'Assertion metadata')
    content = content.replace('Public Artifact', 'Public artifact')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done")
else:
    print("Not found")
