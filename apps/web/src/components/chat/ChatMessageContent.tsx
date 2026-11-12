import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

function isSafeInternalPath(href: string): boolean {
  return /^\/(?:products\/[0-9a-f-]{36}|orders|catalog)?(?:[?#].*)?$/i.test(href.trim());
}

function parseInline(text: string): ReactNode[] {
  const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(')')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const [, label, href] = match;
        if (href && isSafeInternalPath(href)) {
          return (
            <Link key={index} to={href.trim()} className="chat-inline-link">
              {label}
            </Link>
          );
        }
        return label;
      }
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} className="chat-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map(cell => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|') || !trimmed.includes('-')) return false;
  const cells = splitTableRow(trimmed);
  return cells.length >= 2 && cells.every(cell => /^:?-{2,}:?$/.test(cell));
}

export function ChatMessageContent({
  content,
  isStreaming
}: {
  content: string;
  isStreaming?: boolean;
}) {
  if (!content) {
    return isStreaming ? (
      <span className="chat-streaming-cursor" aria-hidden="true">
        ▌
      </span>
    ) : null;
  }

  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let currentList: { type: 'ol' | 'ul'; start?: number; items: ReactNode[] } | null = null;

  function flushList() {
    if (!currentList) return;
    const key = `list-${elements.length}`;
    if (currentList.type === 'ol') {
      elements.push(
        <ol key={key} className="chat-ol" start={currentList.start ?? 1}>
          {currentList.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={key} className="chat-ul">
          {currentList.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
    currentList = null;
  }

  for (let index = 0; index < lines.length; index++) {
    const rawLine = lines[index]!;
    const line = rawLine.trim();
    if (!line) {
      if (currentList?.type === 'ol') {
        let nextIdx = index + 1;
        while (nextIdx < lines.length && !lines[nextIdx]!.trim()) nextIdx++;
        if (nextIdx < lines.length && /^\d+\.\s+/.test(lines[nextIdx]!.trim())) {
          continue;
        }
      }
      flushList();
      continue;
    }

    // Fenced code / spec block detection: ```
    if (line.startsWith('```')) {
      flushList();
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index]!.trim().startsWith('```')) {
        codeLines.push(lines[index]!);
        index++;
      }
      elements.push(
        <pre key={`code-${elements.length}`} className="chat-code-block">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Blockquote / Verdict Callout detection: > ...
    if (line.startsWith('>')) {
      flushList();
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index]!.trim().startsWith('>')) {
        const cleanedQuote = lines[index]!.trim().replace(/^>\s?/, '');
        if (cleanedQuote) quoteLines.push(cleanedQuote);
        index++;
      }
      index--;
      if (quoteLines.length > 0) {
        elements.push(
          <blockquote key={`quote-${elements.length}`} className="chat-callout">
            {quoteLines.map((qLine, qIdx) => (
              <p key={qIdx} className="chat-callout-line">
                {parseInline(qLine)}
              </p>
            ))}
          </blockquote>
        );
      }
      continue;
    }

    // Markdown table block detection: header row + |---|---| separator row
    if (line.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1]!)) {
      flushList();
      const headers = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length) {
        const rowLine = lines[index]!.trim();
        if (!rowLine || !rowLine.includes('|')) {
          index--;
          break;
        }
        rows.push(splitTableRow(rowLine));
        index++;
      }
      elements.push(
        <div key={`tbl-${elements.length}`} className="chat-table-wrap">
          <table className="chat-table">
            <thead>
              <tr>
                {headers.map((header, hIdx) => (
                  <th key={hIdx}>{parseInline(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((cells, rIdx) => (
                <tr key={rIdx}>
                  {headers.map((_, cIdx) => (
                    <td key={cIdx}>{parseInline(cells[cIdx] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      elements.push(
        <h4 key={`h-${index}`} className="chat-heading">
          {parseInline(headingMatch[2]!)}
        </h4>
      );
      continue;
    }

    if (line === '---' || line === '***') {
      flushList();
      elements.push(<hr key={`hr-${index}`} className="chat-divider" />);
      continue;
    }

    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (currentList && currentList.type !== 'ol') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'ol', start: Number(olMatch[1]) || 1, items: [] };
      }
      currentList.items.push(parseInline(olMatch[2]!));
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (currentList && currentList.type !== 'ul') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(parseInline(ulMatch[1]!));
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${index}`} className="chat-para">
        {parseInline(line)}
      </p>
    );
  }

  flushList();

  return (
    <div className="chat-markdown">
      {elements}
      {isStreaming && (
        <span className="chat-streaming-cursor" aria-hidden="true">
          ▌
        </span>
      )}
    </div>
  );
}
