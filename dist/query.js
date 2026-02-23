import Groq from "groq-sdk";
import path from "path";
const systemPrompt = `
You are a senior software architect.
Use standard patterns like: /components, /services, /types, /utils, /hooks. For files laying around,
Return ONLY JSON, no markdown.
Do not invent new files, only organize the provided files.

Format:
{
  "moves": [
    { "from": "relative/path/file.ts", "to": "relative/path/newFolder/file.ts" }
  ]
}
  
Example input:
files: ["button.tsx", "api.ts", "helpers.ts"]

Example output:
{
  "moves": [
    { "from": "button.tsx", "to": "components/button.tsx" },
    { "from": "api.ts", "to": "services/api.ts" },
    { "from": "helpers.ts", "to": "utils/helpers.ts" }
  ]
}

Additional guidance:
- For files that are “laying around” and not obviously tied to a technical role, you can group them by relation/context.
- Example: imagine I was coding a tier-list app with a bunch of components like 'tierListRow.tsx', 'tierListColumn.tsx', 'tierListHeader.tsx'. You could group them together into a folder called 'tierList', even if they don’t exactly match a standard role.
- Use common sense to create obvious groupings based on similarity, even if file names are generic.
- If an **existing folder structure** already exists, try to make your moves appropriate to it — do not move files unnecessarily out of their current folders unless it improves grouping.
- Always keep the moves relative to the folder; do not invent new files.
`;
export async function queryGroq(files, folderPath, additionalPrompt) {
    const client = new Groq({
        apiKey: process.env["GROQ_API_KEY"],
    });
    const systemContent = additionalPrompt
        ? `${systemPrompt}\n\n${additionalPrompt}`
        : systemPrompt;
    const folderName = path.basename(folderPath);
    const chatCompletion = await client.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemContent,
            },
            {
                role: "user",
                content: `The following files are inside the "${folderName}" folder. Do NOT create a folder named "${folderName}" inside this folder". Here are the files:\n${files
                    .map((f) => path.relative(folderPath, f))
                    .join("\n")}`,
            },
        ],
        model: "openai/gpt-oss-20b",
        stream: false,
    });
    const text = chatCompletion.choices[0].message.content;
    return text;
}
