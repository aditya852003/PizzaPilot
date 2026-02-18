'use server';

/**
 * @fileOverview Smart upselling flow to suggest relevant add-ons to pizza orders.
 *
 * - suggestAddOn - A function that suggests an add-on for a given pizza order item.
 * - SuggestAddOnInput - The input type for the suggestAddOn function.
 * - SuggestAddOnOutput - The return type for the suggestAddOn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CATEGORIZED_MENU } from '@/lib/menu';

const SuggestAddOnInputSchema = z.object({
  item: z.string().describe('The name of the pizza item being ordered.'),
  orderContext: z
    .string()
    .describe(
      'Additional context about the order, such as previous items ordered or customer preferences.'
    ),
});
export type SuggestAddOnInput = z.infer<typeof SuggestAddOnInputSchema>;

const SuggestAddOnOutputSchema = z.object({
  suggestion: z.string().describe('A relevant add-on suggestion for the pizza item.'),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the add-on suggestion, considering the item and order context.'
    ),
});
export type SuggestAddOnOutput = z.infer<typeof SuggestAddOnOutputSchema>;


const PromptInputSchema = SuggestAddOnInputSchema.extend({
    availableAddOns: z.array(z.string()).describe("A list of available add-on items to suggest from.")
});


export async function suggestAddOn(input: SuggestAddOnInput): Promise<SuggestAddOnOutput> {
  const addOnCategories = ["Sides", "Beverages", "Desserts", "Dips & Add-ons"];
  const availableAddOns = CATEGORIZED_MENU
      .filter(category => addOnCategories.includes(category.title))
      .flatMap(category => category.items.map(item => item.name));

  return suggestAddOnFlow({ ...input, availableAddOns });
}

const suggestAddOnPrompt = ai.definePrompt({
  name: 'suggestAddOnPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: SuggestAddOnOutputSchema},
  prompt: `You are Pizza Pal, a fun and friendly pizza ordering bot. A customer is ordering a pizza item: {{{item}}}.\n\nGiven the following order context: {{{orderContext}}}, suggest one relevant add-on to make their meal even more delicious.\n\n**CRITICAL**: You MUST ONLY suggest one item from the following list of available add-ons: {{{json availableAddOns}}}.\n\nBe playful and persuasive in your reasoning. Keep the reasoning to a short, catchy sentence. Return the suggestion and reasoning in a JSON format.\n\nFor example, if the item is "Margherita Pizza" and the order context is "no previous items", a good suggestion might be "Garlic Bread" with the reasoning "The perfect companion for your classic pizza!".\n\nOutput:\nSuggestion: <add-on suggestion>\nReasoning: <short, catchy reasoning>`,
});

const suggestAddOnFlow = ai.defineFlow(
  {
    name: 'suggestAddOnFlow',
    inputSchema: PromptInputSchema,
    outputSchema: SuggestAddOnOutputSchema,
  },
  async input => {
    const {output} = await suggestAddOnPrompt(input);
    return output!;
  }
);
