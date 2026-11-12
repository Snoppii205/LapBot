export async function* readSse(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader(),
    decoder = new TextDecoder();
  let buffer = '',
    lines: string[] = [];
  const processLine = (raw: string): string | null => {
    const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    if (line === '') {
      const result = lines.join('\n');
      lines = [];
      return result || null;
    }
    if (line.startsWith('data:')) lines.push(line.slice(5).replace(/^ /, ''));
    return null;
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      if (buffer.length > 262144) throw new Error('SSE_FRAME_TOO_LARGE');
      let index: number;
      while ((index = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        const data = processLine(line);
        if (data !== null) yield data;
      }
      if (done) {
        if (buffer) {
          const data = processLine(buffer);
          if (data !== null) yield data;
        }
        if (lines.length) {
          const trailing = lines.join('\n').trim();
          lines = [];
          if (trailing === '[DONE]') {
            yield '[DONE]';
            break;
          }
          throw new Error('SSE_TRUNCATED');
        }
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
