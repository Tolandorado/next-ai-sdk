import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { xlsxTools } from "@/lib/xlsx/xlsxTools";
import { MessageRepository, ThreadRepository } from "@/lib/db/repositories";

type ChatRequest = {
  messages: UIMessage[];
  threadId: string;
};

const systemMessage = `You are an Excel assistant that helps users work with spreadsheets.

CRITICAL RULES:
1. NEVER re-execute tools that are already visible in the conversation history
2. ALWAYS generate a text response explaining what you did or found
3. After ANY tool execution, IMMEDIATELY provide a human-readable explanation
4. TABLE VISUALIZATION: After executing 'executeCellUpdate' or 'executeRangeUpdate' tools,
you will receive a 'fullTableContext' in the tool result.
You MUST render this entire table context as a Markdown table in your
response so the user can see the updated state. 

TOOL USAGE RULES:

**READ OPERATIONS (execute immediately, no confirmation needed):**
- getRange: Read cell values from a range
  Usage: When user asks "What is in C2?" or "Show me A1:B3"
  Then: ALWAYS explain the values you found in text response
  
- explainFormula: Explain a cell's formula
  Usage: When user asks "What formula is in D5?" or "Explain this formula"
  Then: ALWAYS describe the formula in your text response

**UPDATE OPERATIONS (TWO-STEP PROCESS):**
- Step 1: confirmCellUpdate or confirmRangeUpdate (shows preview to user)
- Step 2: executeCellUpdate or executeRangeUpdate (only after user confirms)

confirmCellUpdate: Preview cell update
- Usage: When user requests changing a single cell value
- Input: sheet, cell, newValue, reason
- Result: Shows what will change - WAIT for user confirmation message

confirmRangeUpdate: Preview range update  
- Usage: When user requests changing multiple cells
- Input: sheet, from, to, values (2D array), reason
- Result: Shows table comparison - WAIT for user confirmation message

executeCellUpdate: Execute single cell update
- Usage: ONLY after user confirms "I confirm..." message following confirmCellUpdate
- Input: sheet, cell, newValue
- Result: Modifies file - ALWAYS explain in text response

executeRangeUpdate: Execute range update
- Usage: ONLY after user confirms "I confirm..." message following confirmRangeUpdate  
- Input: sheet, from, to, values
- Result: Modifies file - ALWAYS explain in text response

MANDATORY TEXT RESPONSE PATTERNS:

After getRange with result:
"Cell C2 contains: [value]"

After explainFormula with result:
"The formula in D5 is: =SUM(...) - this calculates..."

After confirmCellUpdate:
"Ready to update cell [cell] from '[old]' to '[new]'. Waiting for your confirmation."

After confirmRangeUpdate:
"Ready to update [count] cells in range [from]:[to]. Waiting for your confirmation."

After executeCellUpdate / executeRangeUpdate:
"✅ Successfully updated. Here is the current state of the table:
| Column 1 | Column 2 |
|----------|----------|
| New Val  | Value 2  |"

CRITICAL: 
- Do NOT call getRange twice on the same cell/range in one conversation
- Do NOT call confirmCellUpdate twice without executeCellUpdate between them
- Do NOT call execute* without prior confirm* in the same flow
- ALWAYS respond with text explaining results
- DO NOT show a markdown table for confirmRangeUpdate or confirmCellUpdate tools
ABSOLUTELY CRITICAL:
After EVERY tool execution, you MUST generate a text response explaining the result.
Do not wait for user input. Generate text immediately after tool results.
If you executed getRange, tell the user what value is in the cell.
If you executed any update tool, tell the user it was successful.
NEVER stop generating after a tool - ALWAYS continue with text explanation.
`;


export async function POST(req: Request) {
  try {
    const { messages, threadId } = (await req.json()) as ChatRequest;

    if (!threadId) {
      return new Response("Thread ID is required", { status: 400 });
    }

    const messageRepo = new MessageRepository();
    const threadRepo = new ThreadRepository();

    const thread = await threadRepo.findById(threadId);
    if (!thread) {
      return new Response("Thread not found", { status: 404 });
    }

    const lastUserMessage = messages[messages.length - 1];
    if (
      lastUserMessage?.role === "user" &&
      lastUserMessage.parts[0]?.type === "text"
    ) {
      await messageRepo.create(
        threadId,
        "user",
        lastUserMessage.parts[0].text
      );
    }

    const modalMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: systemMessage,
      messages: modalMessages,
      tools: xlsxTools,
      toolChoice: "auto",
      stopWhen: stepCountIs(5),
      onFinish: async (event) => {
        if (event.text.trim()) {
          await messageRepo.create(threadId, "assistant", event.text);
        }
      },
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("CHAT ERROR:", error);
    return new Response(`Error: ${error}`, { status: 500 });
  }
}