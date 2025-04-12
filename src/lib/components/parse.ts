// $lib/components/parse.ts
import { fit } from 'furigana';

export type Token =
  | { _tag: "kana"; value: string }
  | { _tag: "kanji"; value: { symbol: string; furigana: string } };

type ParserResult =
  | { _tag: "Success"; value: Token[] }
  | { _tag: "Error"; value: string };

/**
 * Parses a string containing furigana markup.
 * Expected format: plain kana interleaved with annotations like {kanji|reading}.
 * Example: "かり{気|き}まに{配|くば}にん"
 *
 * On success, returns a Success result with an array of tokens.
 * On error, returns an Error result with a message.
 */
export function parser(input: string): ParserResult {
  const regex = /\{([^|{}]+)\|([^|{}]+)\}/g;
  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  try {
    // Loop over all matches for annotated segments.
    while ((match = regex.exec(input)) !== null) {
      // Add any plain text before this match as a kana token.
      if (match.index > lastIndex) {
        tokens.push({ _tag: "kana", value: input.slice(lastIndex, match.index) });
      }
      // Extract the kanji symbol and its reading.
      const symbol = match[1];
      const reading = match[2];
      // Use the fit function to adjust the reading.
      const fittedReading = fit(symbol, reading);
      tokens.push({
        _tag: "kanji",
        value: { symbol, furigana: fittedReading }
      });
      lastIndex = regex.lastIndex;
    }
    // Add any remaining plain text after the last match.
    if (lastIndex < input.length) {
      tokens.push({ _tag: "kana", value: input.slice(lastIndex) });
    }
    return { _tag: "Success", value: tokens };
  } catch (error) {
    return { _tag: "Error", value: "Error parsing furigana: " + (error instanceof Error ? error.message : String(error)) };
  }
}
