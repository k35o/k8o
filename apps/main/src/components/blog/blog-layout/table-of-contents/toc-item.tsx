import type { FC } from 'react';

export type TocNode = {
  text: string;
  children?: readonly TocNode[];
};

export const TocItem: FC<{
  node: TocNode;
  depth: number;
  activeId: string;
  linkClassName: string | undefined;
  onNavigate: (id: string) => void;
}> = ({ node, depth, activeId, linkClassName, onNavigate }) => (
  <li>
    <a
      aria-current={activeId === node.text ? 'location' : undefined}
      className={linkClassName}
      data-depth={depth}
      href={`#${node.text}`}
      onClick={() => {
        onNavigate(node.text);
      }}
    >
      {node.text}
    </a>
    {node.children && node.children.length > 0 && (
      <ul>
        {node.children.map((child) => (
          <TocItem
            activeId={activeId}
            depth={depth + 1}
            key={child.text}
            linkClassName={linkClassName}
            node={child}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    )}
  </li>
);
