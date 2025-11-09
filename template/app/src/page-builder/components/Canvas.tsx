import { useCallback, useState } from "react";
import { ComponentNode, SelectionState } from "../types";
import { RenderComponent } from "./RenderComponent";
import { cn } from "../../lib/utils";

interface CanvasProps {
  componentTree: ComponentNode | null;
  onComponentTreeChange: (tree: ComponentNode | null) => void;
  selection: SelectionState;
  onSelectionChange: (selection: SelectionState) => void;
  mode: "edit" | "preview";
}

export default function Canvas({
  componentTree,
  onComponentTreeChange,
  selection,
  onSelectionChange,
  mode,
}: CanvasProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const componentType = e.dataTransfer.getData("component-type");
      if (!componentType) return;

      const newComponent: ComponentNode = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: componentType,
        props: getDefaultProps(componentType),
        styles: getDefaultStyles(componentType),
        children: componentType === "container" ? [] : undefined,
      };

      if (componentTree) {
        onComponentTreeChange({
          ...componentTree,
          children: [...(componentTree.children || []), newComponent],
        });
      } else {
        // Create root container if no tree exists
        onComponentTreeChange({
          id: "root",
          type: "container",
          props: {},
          styles: {
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            padding: "24px",
          },
          children: [newComponent],
        });
      }

      onSelectionChange({
        ...selection,
        selectedComponentId: newComponent.id,
      });
    },
    [componentTree, onComponentTreeChange, selection, onSelectionChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const updateComponent = useCallback(
    (id: string, updates: Partial<ComponentNode>) => {
      if (!componentTree) return;

      const updateNode = (node: ComponentNode): ComponentNode => {
        if (node.id === id) {
          return { ...node, ...updates };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateNode),
          };
        }
        return node;
      };

      onComponentTreeChange(updateNode(componentTree));
    },
    [componentTree, onComponentTreeChange]
  );

  const deleteComponent = useCallback(
    (id: string) => {
      if (!componentTree) return;

      const deleteNode = (node: ComponentNode): ComponentNode | null => {
        if (node.id === id) {
          return null;
        }
        if (node.children) {
          const filteredChildren = node.children
            .map(deleteNode)
            .filter((n): n is ComponentNode => n !== null);
          return { ...node, children: filteredChildren };
        }
        return node;
      };

      const updated = deleteNode(componentTree);
      onComponentTreeChange(updated);
      onSelectionChange({ ...selection, selectedComponentId: null });
    },
    [componentTree, onComponentTreeChange, selection, onSelectionChange]
  );

  if (!componentTree && mode === "edit") {
    return (
      <div
        className={cn(
          "flex-1 flex items-center justify-center border-2 border-dashed border-border bg-muted/20",
          dragOver && "border-primary bg-primary/10"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center p-8">
          <p className="text-lg font-medium text-foreground mb-2">
            Drop components here
          </p>
          <p className="text-sm text-muted-foreground">
            Drag components from the library to start building
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 overflow-auto bg-background",
        mode === "edit" && "border-2 border-dashed border-transparent",
        dragOver && "border-primary bg-primary/5"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {componentTree && (
        <div className="min-h-full">
          <RenderComponent
            node={componentTree}
            selection={selection}
            onSelectionChange={onSelectionChange}
            onUpdate={updateComponent}
            onDelete={deleteComponent}
            mode={mode}
            depth={0}
          />
        </div>
      )}
    </div>
  );
}

function getDefaultProps(type: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    container: { className: "" },
    text: { content: "Edit this text", tag: "p" },
    button: { label: "Click me", onClick: "" },
    image: { src: "https://via.placeholder.com/400x300", alt: "Image" },
    heading: { content: "Heading", level: "h1" },
  };
  return defaults[type] || {};
}

function getDefaultStyles(type: string): React.CSSProperties {
  const defaults: Record<string, React.CSSProperties> = {
    container: {
      display: "flex",
      flexDirection: "column",
      padding: "16px",
      minHeight: "100px",
    },
    text: {
      fontSize: "16px",
      color: "#000000",
      fontWeight: "400",
      margin: "0",
    },
    button: {
      padding: "12px 24px",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "500",
    },
    image: {
      width: "100%",
      height: "auto",
      objectFit: "cover",
      borderRadius: "8px",
    },
    heading: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#000000",
      margin: "0 0 16px 0",
    },
  };
  return defaults[type] || {};
}

