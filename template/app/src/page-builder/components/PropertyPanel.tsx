import { ComponentNode } from "../types";
import { componentDefinitions } from "./ComponentLibrary";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface PropertyPanelProps {
  selectedComponent: ComponentNode | null;
  onUpdate: (updates: Partial<ComponentNode>) => void;
}

export default function PropertyPanel({
  selectedComponent,
  onUpdate,
}: PropertyPanelProps) {
  if (!selectedComponent) {
    return (
      <div className="w-80 h-full bg-card border-l border-border p-4">
        <div className="text-center text-muted-foreground mt-8">
          <p className="text-sm">Select a component to edit properties</p>
        </div>
      </div>
    );
  }

  const definition = componentDefinitions.find(
    (def) => def.type === selectedComponent.type
  );

  if (!definition) {
    return (
      <div className="w-80 h-full bg-card border-l border-border p-4">
        <p className="text-sm text-muted-foreground">
          Unknown component type
        </p>
      </div>
    );
  }

  const updateProp = (key: string, value: any) => {
    onUpdate({
      props: {
        ...selectedComponent.props,
        [key]: value,
      },
    });
  };

  const updateStyle = (key: string, value: string) => {
    onUpdate({
      styles: {
        ...selectedComponent.styles,
        [key]: value,
      },
    });
  };

  return (
    <div className="w-80 h-full bg-card border-l border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {definition.displayName}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedComponent.type}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Props Section */}
        {definition.editableProps.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Properties
            </h3>
            <div className="space-y-3">
              {definition.editableProps.map((propKey) => (
                <div key={propKey}>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    {propKey}
                  </Label>
                  {propKey === "tag" || propKey === "level" ? (
                    <Select
                      value={selectedComponent.props[propKey] || ""}
                      onValueChange={(value) => updateProp(propKey, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {propKey === "tag"
                          ? ["p", "span", "div", "label"].map((tag) => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))
                          : ["h1", "h2", "h3", "h4", "h5", "h6"].map(
                              (level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              )
                            )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={selectedComponent.props[propKey] || ""}
                      onChange={(e) => updateProp(propKey, e.target.value)}
                      placeholder={`Enter ${propKey}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Styles Section */}
        {definition.editableStyles.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Styles
            </h3>
            <div className="space-y-3">
              {definition.editableStyles.map((styleKey) => (
                <div key={styleKey}>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    {styleKey}
                  </Label>
                  <Input
                    value={
                      selectedComponent.styles[styleKey as keyof typeof selectedComponent.styles] || ""
                    }
                    onChange={(e) => updateStyle(styleKey, e.target.value)}
                    placeholder={`Enter ${styleKey}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

