import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import NotFound from "@/pages/not-found";
import LiveRecognition from "@/pages/LiveRecognition";
import Enrollment from "@/pages/Enrollment";
import Database from "@/pages/Database";

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden font-body">
      <Sidebar />
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8 h-screen overflow-y-auto">
        <Switch>
          <Route path="/" component={LiveRecognition} />
          <Route path="/enroll" component={Enrollment} />
          <Route path="/database" component={Database} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
