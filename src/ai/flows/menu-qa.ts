'use server';
/**
 * @fileOverview An AI flow to answer customer questions about the menu or add items to an order.
 *
 * - answerMenuQuestion - A function to generate a natural language response or identify an item to order.
 * - MenuQuestionOutput - The return type for the answerMenuQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ALL_MENU_ITEMS } from '@/lib/menu';

const MenuQuestionInputSchema = z.object({
  userQuery: z.string().describe("The user's question about the menu."),
  menuJson: z.string().describe("The restaurant's full menu, formatted as a JSON string, including item IDs.")
});
type MenuQuestionInput = z.infer<typeof MenuQuestionInputSchema>;

const MenuQuestionOutputSchema = z.object({
  action: z.enum(['answer', 'order', 'not_found']).describe("The action to take: 'answer' a question, 'order' an item, or 'not_found' if the item doesn't exist."),
  answer: z.string().describe("The AI's helpful and conversational answer. Use this for 'answer' and 'not_found' actions, or as a confirmation for an 'order' action."),
  item: z.object({
      id: z.string().describe("The unique ID of the menu item."),
      name: z.string().describe("The name of the menu item.")
  }).nullable().describe("The menu item to add to the order. Use this for the 'order' action."),
});
export type MenuQuestionOutput = z.infer<typeof MenuQuestionOutputSchema>;

export async function answerMenuQuestion(userQuery: string): Promise<MenuQuestionOutput> {
  // Pass all menu items with their IDs to the prompt context.
  const menuJson = JSON.stringify(ALL_MENU_ITEMS, null, 2);
  return menuQuestionFlow({ userQuery, menuJson });
}

const menuQuestionPrompt = ai.definePrompt({
  name: 'menuQuestionPrompt',
  input: { schema: MenuQuestionInputSchema },
  output: { schema: MenuQuestionOutputSchema },
  prompt: `
You are PizzaPilot AI — a friendly and helpful conversational assistant for a pizza restaurant.

Your role is to understand customer messages and take one of two actions:
1.  **Answer a Question:** If the user asks a question about the menu (e.g., "what pizzas do you have?", "is the pepperoni spicy?", "what's under 300?"), provide a helpful, conversational answer.
2.  **Add to Order:** If the user explicitly asks to order an item (e.g., "add a margherita", "I want a pepperoni pizza", "give me a coke"), identify the item and prepare it for the order.

You will determine the user's intent and respond with a specific structured action.

**CRITICAL RULES:**
1.  **Grounding:** You MUST base your answers and orders STRICTLY and SOLELY on the menu provided below. Do not invent items, prices, or categories.
2.  **Intent Detection:**
    *   If it's a question, set \`action\` to \`answer\` and provide the text in the \`answer\` field. The \`item\` field should be null.
    *   If it's a clear request to order an item, set \`action\` to \`order\` and provide the exact \`id\` and \`name\` of the item from the menu in the \`item\` field. You can also provide a confirmation message in the \`answer\` field.
    *   If you cannot understand the request or the item is not on the menu, set \`action\` to \`not_found\` and explain politely in the \`answer\` field.
3.  **Tone:** Be friendly, concise, and helpful. Act like a knowledgeable restaurant staff member.

----------------------------------------
MENU CONTEXT (JSON format, includes item IDs)
----------------------------------------
{{{menuJson}}}
----------------------------------------

**EXAMPLES:**

User Query: "what pizzas do you have under 300?"
Your Output: { "action": "answer", "answer": "We have the Margherita pizza for ₹250. It's a classic!", "item": null }

User Query: "I'll have a pepperoni pizza"
Your Output: { "action": "order", "answer": "One Pepperoni pizza, coming right up!", "item": { "id": "pepperoni", "name": "Pepperoni" } }

User Query: "do you have burgers?"
Your Output: { "action": "not_found", "answer": "We specialize in pizzas and don't have burgers on our menu right now. But we have some great sides like Garlic Bread and BBQ Chicken Wings!", "item": null }

----------------------------------------
Now, process the following user query based on the menu provided.

USER QUERY:
"{{{userQuery}}}"
`,
});

const menuQuestionFlow = ai.defineFlow(
  {
    name: 'menuQuestionFlow',
    inputSchema: MenuQuestionInputSchema,
    outputSchema: MenuQuestionOutputSchema,
  },
  async (input: MenuQuestionInput) => {
    const { output } = await menuQuestionPrompt(input);
    return output!;
  }
);
