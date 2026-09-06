/**
 * The example rules offered in the composer UI.
 *
 * Single source of truth on purpose: these same strings are asserted to compose
 * successfully against the offline library, so the deployed demo — which has no
 * model key — can never offer a suggestion chip that then fails. This module
 * imports nothing, so both the client component and the server-side composer
 * can use it.
 */
export const RULE_EXAMPLES = [
  'FX rates must be dated the invoice transaction date',
  'Only use FX rates from an approved provider',
  'Never post into a closed accounting period',
  'Any journal entry must cite a supporting document',
  'Do not post a second entry for a payment already recorded',
] as const;
