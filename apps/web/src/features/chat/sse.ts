export type ChatFrame = { event: string; data: Record<string, unknown> };
export class ChatSseParser {
  private decoder = new TextDecoder();
  private buffer = '';
  push(chunk: Uint8Array, final = false): ChatFrame[] {
    this.buffer = (this.buffer + this.decoder.decode(chunk, { stream: !final })).replace(
      /\r\n/g,
      '\n'
    );
    const frames: ChatFrame[] = [];
    let index: number;
    while ((index = this.buffer.indexOf('\n\n')) >= 0) {
      const raw = this.buffer.slice(0, index);
      this.buffer = this.buffer.slice(index + 2);
      let event = 'message';
      const data: string[] = [];
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
      }
      if (data.length) {
        try {
          const value: unknown = JSON.parse(data.join('\n'));
          if (value && typeof value === 'object' && !Array.isArray(value))
            frames.push({ event, data: value as Record<string, unknown> });
        } catch {
          /* ignore malformed or partial json line */
        }
      }
    }
    return frames;
  }
}
