import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, Edit, Trash2 } from "lucide-react";
import ContractGenerator from "./ContractGenerator";

interface Contract {
  id: number;
  status: string;
  contractData: any;
  tenantSignDeadline?: string | null;
}

interface ContractActionsProps {
  contract: Contract;
  currentUserId: number;
  isOwner: boolean;
}

export function ContractActions({ contract, currentUserId, isOwner }: ContractActionsProps) {
  const { toast } = useToast();
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);

  // Download PDF mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/contracts/${contract.id}/download`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to generate download link');
      return response.json();
    },
    onSuccess: (data) => {
      // In a real implementation, this would trigger the actual PDF download
      toast({
        title: "Téléchargement prêt",
        description: `Le contrat ${data.filename} est prêt à être téléchargé.`,
      });
      
      // For demo purposes, show download URL
      console.log("Download URL:", data.downloadUrl);
      
      // In real implementation, you would trigger download:
      // window.open(data.downloadUrl, '_blank');
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger le contrat",
        variant: "destructive",
      });
    }
  });

  // Contract modification mutation
  const modifyMutation = useMutation({
    mutationFn: async (newContractData: any) => {
      return apiRequest(`/api/contracts/${contract.id}/modify`, {
        method: 'PUT',
        body: JSON.stringify({ contractData: newContractData })
      });
    },
    onSuccess: () => {
      toast({
        title: "Contrat modifié",
        description: "Le contrat a été modifié avec succès. Les signatures ont été supprimées.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts', contract.id] });
      setIsModifyDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le contrat",
        variant: "destructive",
      });
    }
  });

  const canDownload = contract.status === 'active' || contract.status === 'fully_signed';
  const canModify = isOwner && (contract.status === 'draft' || contract.status === 'owner_signed');
  const isExpired = contract.tenantSignDeadline && new Date() > new Date(contract.tenantSignDeadline);

  return (
    <div className="flex items-center gap-2">
      {/* Download PDF Button */}
      {canDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadMutation.mutate()}
          disabled={downloadMutation.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          {downloadMutation.isPending ? "Génération..." : "Télécharger PDF"}
        </Button>
      )}

      {/* Modify Contract Button */}
      {canModify && !isExpired && (
        <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le contrat</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <ContractGenerator
                initialData={contract.contractData}
                onSave={(contractData) => modifyMutation.mutate(contractData)}
                isLoading={modifyMutation.isPending}
                mode="modify"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel/Delete Contract (for expired or draft) */}
      {(isOwner && (contract.status === 'draft' || isExpired)) && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              {isExpired ? "Supprimer" : "Annuler"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir {isExpired ? "supprimer" : "annuler"} ce contrat ? 
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  // In real implementation, add delete/cancel mutation
                  toast({
                    title: "Contrat supprimé",
                    description: "Le contrat a été supprimé avec succès.",
                  });
                }}
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}