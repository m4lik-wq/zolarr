// AI mesajını sesli okuma için temizler.

const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{FE0F}\u{200D}]/gu;
const URL_RE = /https?:\/\/\S+/g;

export function cleanForSpeech(text: string): string {
  let out = text;
  out = out.replace(URL_RE, 'link');
  out = out.replace(EMOJI_RE, '');
  // Heading: replace marker + content + trailing newline with "content. "
  out = out.replace(/^\s*#{1,6}\s+(.+?)(\n|$)/gm, '$1. ');
  out = out.replace(/^\s*[-*+]\s+/gm, '');
  out = out.replace(/\*\*(.+?)\*\*/g, '$1');
  out = out.replace(/\*(.+?)\*/g, '$1');
  out = out.replace(/`([^`]+)`/g, '$1');
  out = out.replace(/\n+/g, ', ');
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}
