import { Layout, Type, Square, Image, MousePointerClick, Container } from "lucide-react";
import { ComponentDefinition } from "../types";

const componentDefinitions: ComponentDefinition[] = [
  {
    type: "container",
    displayName: "Container",
    icon: "container",
    category: "Layout",
    defaultProps: {
      className: "",
    },
    defaultStyles: {
      display: "flex",
      flexDirection: "column",
      padding: "16px",
      minHeight: "100px",
    },
    editableProps: ["className"],
    editableStyles: [
      "display",
      "flexDirection",
      "padding",
      "margin",
      "backgroundColor",
      "borderRadius",
      "width",
      "height",
      "minHeight",
      "gap",
    ],
  },
  {
    type: "text",
    displayName: "Text",
    icon: "text",
    category: "Content",
    defaultProps: {
      content: "Edit this text",
      tag: "p",
    },
    defaultStyles: {
      fontSize: "16px",
      color: "#000000",
      fontWeight: "400",
      margin: "0",
    },
    editableProps: ["content", "tag"],
    editableStyles: [
      "fontSize",
      "fontWeight",
      "color",
      "textAlign",
      "margin",
      "padding",
      "lineHeight",
    ],
  },
  {
    type: "button",
    displayName: "Button",
    icon: "button",
    category: "Interactive",
    defaultProps: {
      label: "Click me",
      onClick: "",
    },
    defaultStyles: {
      padding: "12px 24px",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "500",
    },
    editableProps: ["label", "onClick"],
    editableStyles: [
      "padding",
      "backgroundColor",
      "color",
      "border",
      "borderRadius",
      "fontSize",
      "fontWeight",
      "width",
      "height",
    ],
  },
  {
    type: "image",
    displayName: "Image",
    icon: "image",
    category: "Media",
    defaultProps: {
      src: "https://via.placeholder.com/400x300",
      alt: "Image",
    },
    defaultStyles: {
      width: "100%",
      height: "auto",
      objectFit: "cover",
      borderRadius: "8px",
    },
    editableProps: ["src", "alt"],
    editableStyles: [
      "width",
      "height",
      "objectFit",
      "borderRadius",
      "margin",
      "padding",
    ],
  },
  {
    type: "heading",
    displayName: "Heading",
    icon: "heading",
    category: "Content",
    defaultProps: {
      content: "Heading",
      level: "h1",
    },
    defaultStyles: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#000000",
      margin: "0 0 16px 0",
    },
    editableProps: ["content", "level"],
    editableStyles: [
      "fontSize",
      "fontWeight",
      "color",
      "textAlign",
      "margin",
      "padding",
    ],
  },
];

const iconMap: Record<string, React.ReactNode> = {
  container: <Container className="w-5 h-5" />,
  text: <Type className="w-5 h-5" />,
  button: <MousePointerClick className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  heading: <Type className="w-5 h-5" />,
};

interface ComponentLibraryProps {
  onComponentSelect: (component: ComponentDefinition) => void;
}

export default function ComponentLibrary({
  onComponentSelect,
}: ComponentLibraryProps) {
  const categories = Array.from(
    new Set(componentDefinitions.map((c) => c.category))
  );

  return (
    <div className="w-64 h-full bg-card border-r border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Components</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag components to canvas
        </p>
      </div>

      <div className="p-4 space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {category}
            </h3>
            <div className="space-y-1">
              {componentDefinitions
                .filter((c) => c.category === category)
                .map((component) => (
                  <button
                    key={component.type}
                    onClick={() => onComponentSelect(component)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground transition-colors text-left"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "component-type",
                        component.type
                      );
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                  >
                    <div className="text-foreground">
                      {iconMap[component.icon] || (
                        <Square className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {component.displayName}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { componentDefinitions };

