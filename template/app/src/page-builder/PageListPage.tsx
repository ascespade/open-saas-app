import { useQuery, useAction } from "wasp/client/operations";
import { getPage, getUserPages, deletePage } from "wasp/client/operations";
import { Link } from "wasp/client/router";
import { routes } from "wasp/client/router";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { useState } from "react";
import FirstRunConfig from "./FirstRunConfig";

export default function PageListPage() {
  const { data: pages, isLoading } = useQuery(getUserPages);
  const deletePageAction = useAction(deletePage);
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deletePageAction({ id });
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete page",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <FirstRunConfig />
      <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Page Builder</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your pages
            </p>
          </div>
          <Link to={routes.PageBuilderRoute.to}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </Link>
        </div>

        {!pages || pages.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No pages yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first page with the visual page builder.
              </p>
              <Link to={routes.PageBuilderRoute.to}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Page
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {page.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      /{page.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span>
                    Created: {new Date(page.createdAt).toLocaleDateString()}
                  </span>
                  {page.updatedAt && (
                    <span>
                      • Updated: {new Date(page.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`${routes.PageBuilderRoute.to}?id=${page.id}` as any}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(page.id, page.name)}
                    disabled={deletingId === page.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

