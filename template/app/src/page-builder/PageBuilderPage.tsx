import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "wasp/client/auth";
import { useQuery, useAction } from "wasp/client/operations";
import { getPage, savePage, deletePage } from "wasp/client/operations";
import { ComponentNode, SelectionState, EditorMode } from "./types";
import ComponentLibrary from "./components/ComponentLibrary";
import Canvas from "./components/Canvas";
import PropertyPanel from "./components/PropertyPanel";
import { componentDefinitions } from "./components/ComponentLibrary";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Save, Eye, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

export default function PageBuilderPage() {
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get("id") || undefined;
  const { data: user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<EditorMode>("edit");
  const [selection, setSelection] = useState<SelectionState>({
    selectedComponentId: null,
    hoveredComponentId: null,
  });
  const [componentTree, setComponentTree] = useState<ComponentNode | null>(
    null
  );
  const [pageName, setPageName] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: page, isLoading } = useQuery(
    getPage,
    pageId ? { id: pageId } : undefined
  );

  const savePageAction = useAction(savePage);
  const deletePageAction = useAction(deletePage);

  useEffect(() => {
    if (page) {
      setPageName(page.name);
      setPageSlug(page.slug);
      if (page.componentTree) {
        try {
          const tree = JSON.parse(page.componentTree);
          setComponentTree(tree);
        } catch (e) {
          console.error("Failed to parse component tree", e);
        }
      }
    } else if (!pageId) {
      // New page - set defaults
      setPageName("");
      setPageSlug("");
      setComponentTree(null);
    }
  }, [page, pageId]);

  const handleComponentSelect = useCallback(
    (component: typeof componentDefinitions[0]) => {
      const newComponent: ComponentNode = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: component.type,
        props: { ...component.defaultProps },
        styles: { ...component.defaultStyles },
        children: component.type === "container" ? [] : undefined,
      };

      if (componentTree) {
        setComponentTree({
          ...componentTree,
          children: [...(componentTree.children || []), newComponent],
        });
      } else {
        // Create root container
        setComponentTree({
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

      setSelection({
        ...selection,
        selectedComponentId: newComponent.id,
      });
    },
    [componentTree, selection]
  );

  const handleComponentTreeChange = useCallback(
    (tree: ComponentNode | null) => {
      setComponentTree(tree);
    },
    []
  );

  const handleComponentUpdate = useCallback(
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

      setComponentTree(updateNode(componentTree));
    },
    [componentTree]
  );

  const handleSave = useCallback(async () => {
    if (!pageName.trim() || !pageSlug.trim()) {
      toast({
        title: "Error",
        description: "Please enter a page name and slug",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await savePageAction({
        id: pageId || undefined,
        name: pageName,
        slug: pageSlug,
        componentTree: componentTree ? JSON.stringify(componentTree) : null,
      });

      toast({
        title: "Success",
        description: "Page saved successfully",
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save page",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [pageName, pageSlug, componentTree, pageId, savePageAction, toast]);

  const handleDelete = useCallback(async () => {
    if (!pageId) return;

    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      await deletePageAction({ id: pageId });
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
      // Redirect to page list or home
      window.location.href = "/page-builder";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete page",
        variant: "destructive",
      });
    }
  }, [pageId, deletePageAction, toast]);

  const selectedComponent = componentTree
    ? findComponentById(componentTree, selection.selectedComponentId || "")
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            Page Builder
          </h1>
          {pageId && (
            <span className="text-sm text-muted-foreground">
              Editing: {pageName || "Untitled"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={mode === "edit" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("edit")}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={mode === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("preview")}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Page</DialogTitle>
                <DialogDescription>
                  Enter a name and slug for your page
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="page-name">Page Name</Label>
                  <Input
                    id="page-name"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    placeholder="My Page"
                  />
                </div>
                <div>
                  <Label htmlFor="page-slug">Slug</Label>
                  <Input
                    id="page-slug"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                    placeholder="my-page"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {pageId && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        {mode === "edit" && (
          <ComponentLibrary onComponentSelect={handleComponentSelect} />
        )}
        <Canvas
          componentTree={componentTree}
          onComponentTreeChange={handleComponentTreeChange}
          selection={selection}
          onSelectionChange={setSelection}
          mode={mode}
        />
        {mode === "edit" && selectedComponent && (
          <PropertyPanel
            selectedComponent={selectedComponent}
            onUpdate={(updates) =>
              handleComponentUpdate(selectedComponent.id, updates)
            }
          />
        )}
      </div>
    </div>
  );
}

function findComponentById(
  node: ComponentNode,
  id: string
): ComponentNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findComponentById(child, id);
      if (found) return found;
    }
  }
  return null;
}

