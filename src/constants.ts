export const DEFAULT_MARKDOWN_CONTENT = `\
# Markdown Live Previewer

Welcome! Type your **GitHub Flavored Markdown** in the left panel.
The rendered HTML, including Mermaid diagrams, will appear on the right.
Drag the divider in the middle to resize the panels.

---

## Key Features

- Real-time preview
- GitHub Flavored Markdown (GFM) support
  - Tables
  - Strikethrough: ~~like this~~
  - Task lists:
    - [x] Completed item
    - [ ] Incomplete item
- Code block syntax highlighting (basic, via \`marked\`)
- **Mermaid.js diagram rendering!**

---

## Example: JavaScript Code Block

\`\`\`javascript
function greet(name) {
  // This is a comment
  const message = \`Hello, \${name}! Welcome to the Markdown Previewer.\`;
  console.log(message);
  return message;
}

greet('Developer');
\`\`\`

---

## Example: Mermaid Diagram (Flowchart)

\`\`\`mermaid
graph TD
    A[Start App] --> B{Input Markdown};
    B -- Text --> C[Parse with Marked.js];
    C --> D[Render HTML Output];
    B -- Mermaid Block --> E[Extract Mermaid Code];
    E --> F[Render with Mermaid.js];
    D --> G[Display Result];
    F --> G;
    G --> H[Enjoy! 🎉];
\`\`\`

---

## Example: Mermaid Diagram (Sequence Diagram)

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server

    User->>Browser: Enters Markdown text
    Browser->>Browser: Updates input state
    Browser->>Server: (If saving) Send Markdown
    Server-->>Browser: (If saving) Confirmation
    Browser->>Browser: Renders HTML & Mermaid diagram
    User->>Browser: Drags resizer
    Browser->>Browser: Adjusts panel widths
\`\`\`

---

## Example: Table

| Feature          | Status      | Priority |
|------------------|-------------|----------|
| Markdown Parsing | Implemented | High     |
| Mermaid Rendering| Implemented | High     |
| Resizable Panels | Implemented | High     |
| Dark Mode        | Basic       | Medium   |
| Cloud Sync       | Future      | Low      |

Happy previewing!
`;
