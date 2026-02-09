import { useUsers, useDeleteUser } from "@/hooks/use-users";
import { CyberButton } from "@/components/CyberButton";
import { Card } from "@/components/ui/card";
import { Trash2, User, Database as DbIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Database() {
  const { data: users, isLoading } = useUsers();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="font-mono text-primary animate-pulse">ACCESSING ENCRYPTED RECORDS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <DbIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl">Subject Database</h1>
          <p className="text-muted-foreground font-mono">
            TOTAL RECORDS: <span className="text-primary">{users?.length || 0}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((user) => (
          <Card key={user.id} className="group relative overflow-hidden bg-card/50 border-primary/20 hover:border-primary/60 transition-colors p-6">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <User className="w-24 h-24 text-primary" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center border border-primary/40 text-primary font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button 
                      className="text-muted-foreground hover:text-destructive transition-colors p-2 hover:bg-destructive/10 rounded-full"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-destructive/30 bg-black/95">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive font-display">Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400 font-mono">
                        This action will permanently erase the biometric data for subject "{user.name}".
                        This process cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-gray-700 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-white hover:bg-destructive/80"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete Record
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <h3 className="text-xl mb-1">{user.name}</h3>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs font-mono text-muted-foreground border-b border-white/5 pb-2">
                  <span>ID REFERENCE</span>
                  <span className="text-primary">SUB-{user.id.toString().padStart(6, '0')}</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground border-b border-white/5 pb-2">
                  <span>DATE ADDED</span>
                  <span>{user.createdAt ? format(new Date(user.createdAt), "yyyy-MM-dd HH:mm") : "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>BIOMETRIC STATUS</span>
                  <span className="text-green-500">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Corner brackets */}
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary/30 group-hover:border-primary/80 transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary/30 group-hover:border-primary/80 transition-colors" />
          </Card>
        ))}

        {(!users || users.length === 0) && (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-lg bg-black/20">
            <p className="text-muted-foreground font-mono mb-4">DATABASE EMPTY</p>
            <CyberButton variant="outline" onClick={() => window.location.href='/enroll'}>
              ENROLL NEW SUBJECTS
            </CyberButton>
          </div>
        )}
      </div>
    </div>
  );
}
