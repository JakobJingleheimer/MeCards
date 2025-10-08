declare module '*.ico' {
  const content: string;
  export default content;
}
declare module '*.module.css' {
  const content: Record<string, string>;
  export default content;
}
declare module '*.webmanifest' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg' {
  import React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  export default ReactComponent;
}
