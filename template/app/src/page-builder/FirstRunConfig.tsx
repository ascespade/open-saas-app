import { useEffect, useState } from "react";
import { useAuth } from "wasp/client/auth";
import { Link } from "wasp/client/router";
import { routes } from "wasp/client/router";
import { Button } from "../components/ui/button";
import { Sparkles, Layout, Type, Square, Image, MousePointerClick } from "lucide-react";

export default function FirstRunConfig() {
  const { data: user } = useAuth();
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome screen
    const seen = localStorage.getItem("pageBuilderWelcomeSeen");
    setHasSeenWelcome(seen === "true");
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem("pageBuilderWelcomeSeen", "true");
    setHasSeenWelcome(true);
  };

  if (hasSeenWelcome) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Page Builder!
          </h1>
          <p className="text-muted-foreground">
            Create beautiful pages with our visual drag-and-drop editor
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <Layout className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Containers</h3>
              <p className="text-sm text-muted-foreground">
                Build layouts with flexible containers
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Type className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Text & Headings</h3>
              <p className="text-sm text-muted-foreground">
                Add text content and headings
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <MousePointerClick className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Buttons</h3>
              <p className="text-sm text-muted-foreground">
                Create interactive buttons
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Image className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Images</h3>
              <p className="text-sm text-muted-foreground">
                Add images to your pages
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-2">Quick Start Guide</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Drag components from the library to the canvas</li>
              <li>Click on components to select and edit their properties</li>
              <li>Use the property panel to customize styles and content</li>
              <li>Save your page when you're done</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              localStorage.setItem("pageBuilderWelcomeSeen", "true");
              setHasSeenWelcome(true);
            }}
          >
            Skip
          </Button>
          <Link to={routes.PageBuilderRoute.to}>
            <Button onClick={handleGetStarted}>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

