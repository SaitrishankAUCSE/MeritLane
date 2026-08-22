import os
import re

files_to_process = [
    "app/employer/dashboard/page.tsx",
    "app/admin/page.tsx"
]

def process_file(filepath):
    if not os.path.exists(filepath):
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace typography
    content = re.sub(r'text-\[10px\] font-mono uppercase tracking-\[.*?em\]', 'text-[14px] font-sans font-medium', content)
    content = re.sub(r'text-\[11px\] font-mono uppercase tracking-\[.*?em\]', 'text-[14px] font-sans font-medium', content)
    content = re.sub(r'font-mono text-\[10px\] uppercase tracking-\[.*?em\]', 'text-[14px] font-sans font-medium', content)
    content = re.sub(r'font-mono uppercase tracking-\[.*?em\]', 'font-sans font-medium', content)
    
    # Replace radii
    content = content.replace('rounded-lg', 'rounded-md')
    content = content.replace('rounded-xl', 'rounded-md')
    content = content.replace('rounded-2xl', 'rounded-md')
    content = content.replace('rounded-full', 'rounded-md')
    
    # Button heights and spacing
    content = content.replace('py-4', 'py-2 h-10')
    content = content.replace('py-3', 'py-2 h-10')
    
    # Casing
    replacements = {
        "Shortlist Candidate": "Shortlist candidate",
        "Request More Proof": "Request more proof",
        "View IPFS Record": "View IPFS record",
        "View Source": "View source",
        "View Details": "View details",
        "Verify Candidate": "Verify candidate",
        "Reject Candidate": "Reject candidate",
        "Request Changes": "Request changes",
        "Refresh Data": "Refresh data",
        "Load Candidates": "Load candidates",
        "View Proof": "View proof"
    }
    for k, v in replacements.items():
        content = content.replace(f">{k}<", f">{v}<")
        content = content.replace(f"> {k}", f"> {v}")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files_to_process:
    process_file(f)

print("Done")
