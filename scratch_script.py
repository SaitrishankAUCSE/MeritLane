import os
import re

files_to_process = [
    "app/candidate/profile/page.tsx",
    "app/candidate/dashboard/page.tsx",
    "app/candidate/assessment/page.tsx",
    "app/candidate/provenance/page.tsx",
    "components/candidate/CandidateSidebar.tsx"
]

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace primary/secondary button typography
    # Remove uppercase, font-mono, tracking-[0.2em], text-[10px]/text-[11px]
    # Replace with font-sans text-[14px] font-medium
    
    # regex to find standard inline button classes
    content = re.sub(r'text-\[10px\] font-mono uppercase tracking-\[0\.2em\]', 'text-[14px] font-sans font-medium', content)
    content = re.sub(r'font-mono text-\[10px\] uppercase tracking-\[0\.2em\]', 'text-[14px] font-sans font-medium', content)
    content = re.sub(r'text-\[11px\] font-mono uppercase tracking-\[0\.2em\]', 'text-[14px] font-sans font-medium', content)
    content = re.sub(r'font-mono text-\[11px\] uppercase tracking-\[0\.2em\]', 'text-[14px] font-sans font-medium', content)
    content = re.sub(r'font-mono text-\[10px\] font-bold uppercase tracking-\[0\.2em\]', 'text-[14px] font-sans font-medium', content)
    
    # Also fix tracking-widest uppercase from earlier
    content = re.sub(r'text-\[11px\] font-mono uppercase tracking-widest', 'text-[14px] font-sans font-medium', content)
    content = re.sub(r'font-mono text-\[11px\] font-bold uppercase tracking-widest', 'text-[14px] font-sans font-medium', content)
    content = re.sub(r'font-mono text-\[10px\] font-bold uppercase tracking-widest', 'text-[14px] font-sans font-medium', content)
    
    # Fix sentence casing for button text
    replacements = {
        "Edit Identity": "Edit identity",
        "Add Skill": "Add skill",
        "Add Project": "Add project",
        "Test Claim": "Test claim",
        "Add Experience": "Add experience",
        "Start Assessment": "Start assessment",
        "Add Evidence": "Add evidence",
        "Start Verification": "Start verification",
        "View Provenance": "View provenance",
        "Return to Workspace": "Return to workspace",
        "Submit Assessment": "Submit assessment",
        "Copy Public Link": "Copy public link",
        "View Public Record": "View public record",
        "Run Tests": "Run tests",
    }
    for k, v in replacements.items():
        content = content.replace(f">{k}<", f">{v}<")
        content = content.replace(f">[{k}]<", f">[{v}]<")
        content = content.replace(f"[+] {k}", f"Add evidence")
    
    # Fix section headers that are uppercase and monospace tracking
    # Convert them to text-[16px] font-sans font-medium
    content = re.sub(r'text-\[11px\] font-mono uppercase tracking-\[0\.2em\] text-\[#8e928f\]', 'text-[16px] font-sans font-medium text-white', content)
    content = re.sub(r'text-\[10px\] font-mono uppercase tracking-\[0\.2em\] text-\[#8e928f\]', 'text-[16px] font-sans font-medium text-white', content)
    
    # Section Header text replacements
    content = content.replace('Technical Claims (Skills)', 'Technical claims')
    content = content.replace('Experience &amp; Projects', 'Experience & projects')
    content = content.replace('External links', 'External links')
    
    # Make buttons have proper padding and height
    content = re.sub(r'px-5 py-2 h-10', 'px-5 h-10', content)
    content = re.sub(r'px-4 py-2', 'px-4 h-9', content)
    content = re.sub(r'px-6 py-3', 'px-5 h-10', content)
    content = re.sub(r'py-2\.5', 'h-10', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files_to_process:
    process_file(f)

print("Done")
