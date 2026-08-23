import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Hero Eyebrow
content = content.replace(
    '<span className="text-[10px] font-mono tracking-[0.2em] uppercase text-outline">The Meritlane Standard</span>',
    '<span className="text-[12px] font-sans font-medium tracking-widest uppercase text-muted-foreground">The Meritlane Standard</span>'
)

# 2. Update Primary Hero Heading (Instrument Serif, not Playfair)
content = content.replace(
    '<motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-playfair text-foreground tracking-tight leading-[1.05]">',
    '<motion.h1 variants={fadeUp} className="text-[40px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-serif text-foreground tracking-tight leading-[1.05]">'
)

# 3. Update Secondary Hero Line (Visually subordinate #525252)
content = content.replace(
    '<span className="text-muted-foreground">Not just credentials.</span>',
    '<span className="text-[#525252]">Not just credentials.</span>'
)

# 4. Update Hero Body (Inter 17-18px #525252 leading 1.6)
content = content.replace(
    '<motion.p variants={fadeUp} className="mt-8 text-lg text-muted-foreground max-w-xl leading-relaxed">',
    '<motion.p variants={fadeUp} className="mt-8 text-[17px] lg:text-[18px] text-[#525252] max-w-xl leading-[1.6]">'
)

# 5. Update Primary CTA
content = content.replace(
    '<Button size="lg" className="bg-foreground text-background border border-foreground rounded-none px-8 py-7 text-sm font-medium tracking-wide hover:bg-background hover:text-foreground transition-all">',
    '<Button className="bg-[#0D0D0D] text-[#FFFFFF] h-11 px-6 rounded-[6px] text-[14px] font-medium font-sans hover:bg-[#222222] transition-colors border-none">\n                  Start hiring verified talent'
)
content = content.replace(
    'Start Hiring Verified Talent\n              </Button>',
    '</Button>'
)

# 6. Update Secondary CTA
content = content.replace(
    '<Button size="lg" variant="outline" className="rounded-none border-border px-8 py-7 text-sm font-medium tracking-wide hover:bg-surface-low transition-all">',
    '<Button variant="outline" className="h-11 px-6 rounded-[6px] text-[14px] font-medium font-sans border-border hover:bg-surface-low transition-colors text-foreground">\n                  Get verified as an engineer'
)
content = content.replace(
    'Get Verified as an Engineer\n              </Button>',
    '</Button>'
)

# 7. Update Proof Card (Protocol label)
content = content.replace(
    '<div className="text-[10px] font-mono tracking-widest text-outline uppercase mb-2">Protocol 001.A</div>',
    '<div className="text-[11px] font-mono tracking-widest text-[#737373] uppercase mb-2">Protocol 001.A</div>'
)

# 8. Update Proof Card (Main title)
content = content.replace(
    '<div className="text-xl font-serif text-foreground">Verified Technical Profile</div>',
    '<div className="text-[22px] font-serif text-foreground">Verified Technical Profile</div>'
)

# 9. Update Proof Card (Technical Labels)
content = content.replace(
    '<div className="text-[10px] font-mono text-outline uppercase tracking-wider mb-4 border-l-2 border-border pl-3">Audited Stack</div>',
    '<div className="text-[11px] font-mono text-[#737373] uppercase tracking-wider mb-4 border-l-2 border-border pl-3">Audited Stack</div>'
)
content = content.replace(
    '<div className="text-[10px] font-mono text-outline uppercase tracking-wider mb-4 border-l-2 border-border pl-3">Signal Validation Log</div>',
    '<div className="text-[11px] font-mono text-[#737373] uppercase tracking-wider mb-4 border-l-2 border-border pl-3">Signal Validation Log</div>'
)

# 10. Fix Proof Card Skill pills
content = content.replace(
    '<span key={skill} className="px-3 py-1.5 bg-surface-low border border-border text-foreground text-xs font-mono">',
    '<span key={skill} className="px-3 py-1.5 bg-surface border border-[#E5E5E5] text-[#0D0D0D] text-[14px] font-sans font-medium rounded-sm">'
)

# 11. Fix other font-playfair to font-serif globally on page
content = content.replace('font-playfair', 'font-serif')

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
