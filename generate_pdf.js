const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const markdown = fs.readFileSync('all_docs_temp_utf8.md', 'utf-8');

  // We create a basic HTML template that loads marked.js from CDN
  // and renders the markdown on load.
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>MeritLane Documentation</title>
    <!-- Use GitHub markdown CSS for decent styling -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
      body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
      }
      .markdown-body {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
      }
      @media print {
        body { padding: 0; }
        .markdown-body {
          font-size: 12px;
        }
        pre {
          page-break-inside: avoid;
        }
        h1, h2, h3 {
          page-break-after: avoid;
        }
      }
    </style>
  </head>
  <body class="markdown-body">
    <div id="content"></div>
    <script>
      const rawMarkdown = ${JSON.stringify(markdown)};
      document.getElementById('content').innerHTML = marked.parse(rawMarkdown);
    </script>
  </body>
  </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Give the page some time to render the CDN script
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Generate PDF
  await page.pdf({
    path: 'MeritLane_Documentation_Report.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      bottom: '20px',
      left: '20px',
      right: '20px'
    }
  });

  await browser.close();
  console.log('PDF generated successfully at MeritLane_Documentation_Report.pdf');
})();
