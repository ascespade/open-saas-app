import { ComponentNode, SelectionState } from "../types";
import { cn } from "../../lib/utils";
import { Trash2 } from "lucide-react";

interface RenderComponentProps {
  node: ComponentNode;
  selection: SelectionState;
  onSelectionChange: (selection: SelectionState) => void;
  onUpdate: (id: string, updates: Partial<ComponentNode>) => void;
  onDelete: (id: string) => void;
  mode: "edit" | "preview";
  depth: number;
}

export function RenderComponent({
  node,
  selection,
  onSelectionChange,
  onUpdate,
  onDelete,
  mode,
  depth,
}: RenderComponentProps) {
  const isSelected = selection.selectedComponentId === node.id;
  const isHovered = selection.hoveredComponentId === node.id;
  const isEditMode = mode === "edit";

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.stopPropagation();
      onSelectionChange({
        ...selection,
        selectedComponentId: node.id,
      });
    }
  };

  const handleMouseEnter = () => {
    if (isEditMode) {
      onSelectionChange({
        ...selection,
        hoveredComponentId: node.id,
      });
    }
  };

  const handleMouseLeave = () => {
    if (isEditMode) {
      onSelectionChange({
        ...selection,
        hoveredComponentId: null,
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
  };

  const renderContent = () => {
    switch (node.type) {
      case "container":
        return (
          <div
            style={node.styles}
            className={cn(
              isEditMode && "relative",
              isSelected && "ring-2 ring-primary ring-offset-2",
              isHovered && !isSelected && "ring-1 ring-primary/50"
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isEditMode && isSelected && (
              <div className="absolute -top-8 left-0 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-t">
                {node.type}
              </div>
            )}
            {isEditMode && isSelected && (
              <button
                onClick={handleDelete}
                className="absolute -top-8 right-0 bg-destructive text-destructive-foreground p-1 rounded-t hover:bg-destructive/90"
                title="Delete component"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            {node.children?.map((child) => (
              <RenderComponent
                key={child.id}
                node={child}
                selection={selection}
                onSelectionChange={onSelectionChange}
                onUpdate={onUpdate}
                onDelete={onDelete}
                mode={mode}
                depth={depth + 1}
              />
            ))}
          </div>
        );

      case "text":
        const Tag = (node.props.tag || "p") as keyof JSX.IntrinsicElements;
        return (
          <Tag
            style={node.styles}
            className={cn(
              isEditMode && "relative",
              isSelected && "ring-2 ring-primary ring-offset-2",
              isHovered && !isSelected && "ring-1 ring-primary/50"
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isEditMode && isSelected && (
              <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-t">
                {node.type}
              </div>
            )}
            {isEditMode && isSelected && (
              <button
                onClick={handleDelete}
                className="absolute -top-6 right-0 bg-destructive text-destructive-foreground p-1 rounded-t hover:bg-destructive/90"
                title="Delete component"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            {node.props.content || "Edit this text"}
          </Tag>
        );

      case "button":
        return (
          <button
            style={node.styles}
            className={cn(
              isEditMode && "relative",
              isSelected && "ring-2 ring-primary ring-offset-2",
              isHovered && !isSelected && "ring-1 ring-primary/50"
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isEditMode && isSelected && (
              <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-t">
                {node.type}
              </div>
            )}
            {isEditMode && isSelected && (
              <button
                onClick={handleDelete}
                className="absolute -top-6 right-0 bg-destructive text-destructive-foreground p-1 rounded-t hover:bg-destructive/90"
                title="Delete component"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            {node.props.label || "Click me"}
          </button>
        );

      case "image":
        return (
          <div
            className={cn(
              isEditMode && "relative inline-block",
              isSelected && "ring-2 ring-primary ring-offset-2",
              isHovered && !isSelected && "ring-1 ring-primary/50"
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isEditMode && isSelected && (
              <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-t z-10">
                {node.type}
              </div>
            )}
            {isEditMode && isSelected && (
              <button
                onClick={handleDelete}
                className="absolute -top-6 right-0 bg-destructive text-destructive-foreground p-1 rounded-t hover:bg-destructive/90 z-10"
                title="Delete component"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <img
              src={node.props.src || "https://via.placeholder.com/400x300"}
              alt={node.props.alt || "Image"}
              style={node.styles}
            />
          </div>
        );

      case "heading":
        const HeadingTag = (node.props.level || "h1") as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            style={node.styles}
            className={cn(
              isEditMode && "relative",
              isSelected && "ring-2 ring-primary ring-offset-2",
              isHovered && !isSelected && "ring-1 ring-primary/50"
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isEditMode && isSelected && (
              <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-t">
                {node.type}
              </div>
            )}
            {isEditMode && isSelected && (
              <button
                onClick={handleDelete}
                className="absolute -top-6 right-0 bg-destructive text-destructive-foreground p-1 rounded-t hover:bg-destructive/90"
                title="Delete component"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            {node.props.content || "Heading"}
          </HeadingTag>
        );

      default:
        return (
          <div
            style={node.styles}
            className={cn(
              isEditMode && "relative",
              isSelected && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Unknown component: {node.type}
          </div>
        );
    }
  };

  return renderContent();
}

