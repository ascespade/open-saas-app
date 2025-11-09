// Page Builder Types and Interfaces

export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, any>;
  styles: React.CSSProperties;
  children?: ComponentNode[];
  parentId?: string | null;
  meta?: {
    displayName?: string;
    icon?: string;
    category?: string;
  };
}

export interface PageData {
  id?: string;
  name: string;
  slug: string;
  isPublished?: boolean;
  componentTree: ComponentNode | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ComponentDefinition {
  type: string;
  displayName: string;
  icon: string;
  category: string;
  defaultProps: Record<string, any>;
  defaultStyles: React.CSSProperties;
  editableProps: string[];
  editableStyles: string[];
}

export type EditorMode = 'edit' | 'preview';

export interface SelectionState {
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
}

