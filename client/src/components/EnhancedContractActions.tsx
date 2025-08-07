import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, AlertTriangle, Edit, Trash2, Clock, CheckCircle, XCircle, ChevronDown, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useLocation } from 'wouter';

interface ContractActionsProps {
  contract: any;
  currentUserId: number;
  userType: 'tenant' | 'owner';
}

interface RequestStatus {
  id: number;
  type: 'modification' | 'termination';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export function EnhancedContractActions({ contract, currentUserId, userType }: ContractActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [showTerminationDialog, setShowTerminationDialog] = useState(false);
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terminationReason, setTerminationReason] = useState('');
  const [modificationReason, setModificationReason] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Fetch pending requests for this contract
  const { data: pendingRequests = [] } = useQuery<RequestStatus[]>({
    queryKey: [`/api/contracts/${contract.id}/pending-requests`],
    enabled: !!contract.id
  });

  // Find current request statuses
  const terminationRequest = pendingRequests.find(r => r.type === 'termination');
  const modificationRequest = pendingRequests.find(r => r.type === 'modification');

  // Early termination request mutation
  const terminationRequestMutation = useMutation({
    mutationFn: async () => {
      if (!terminationReason.trim()) {
        throw new Error('La raison de la résiliation est obligatoire');
      }
      return apiRequest(`/api/contracts/${contract.id}/request-termination`, {
        method: 'POST',
        body: JSON.stringify({
          requestedBy: currentUserId,
          reason: terminationReason
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'arrêt anticipé a été envoyée au locataire"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contract.id}/pending-requests`] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setShowTerminationDialog(false);
      setTerminationReason('');
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || "Erreur lors de l'envoi de la demande");
      setShowTerminationDialog(false);
    }
  });

  // Modification request mutation
  const modificationRequestMutation = useMutation({
    mutationFn: async () => {
      if (!modificationReason.trim()) {
        throw new Error('La raison de la modification est obligatoire');
      }
      if (selectedFields.length === 0) {
        throw new Error('Vous devez sélectionner au moins un champ à modifier');
      }
      return apiRequest(`/api/contracts/${contract.id}/request-modification`, {
        method: 'POST',
        body: JSON.stringify({
          requestedBy: currentUserId,
          modificationReason: modificationReason,
          fieldsToModify: selectedFields,
          requestedChanges: `Modification demandée pour: ${selectedFields.join(', ')}. Raison: ${modificationReason}`
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Votre demande de modification a été envoyée au locataire"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contract.id}/pending-requests`] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setShowModificationDialog(false);
      setModificationReason('');
      setSelectedFields([]);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || "Erreur lors de l'envoi de la demande");
      setShowModificationDialog(false);
    }
  });

  const getRequestStatusBadge = (status: string, type: string) => {
    const baseClasses = "text-xs px-2 py-1 rounded-full font-medium";
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-300`}>
          <Clock className="w-3 h-3 mr-1" /> En attente
        </Badge>;
      case 'accepted':
        return <Badge variant="outline" className={`${baseClasses} bg-green-50 text-green-700 border-green-300`}>
          <CheckCircle className="w-3 h-3 mr-1" /> Acceptée
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className={`${baseClasses} bg-red-50 text-red-700 border-red-300`}>
          <XCircle className="w-3 h-3 mr-1" /> Refusée
        </Badge>;
      default:
        return null;
    }
  };

  const getButtonText = (requestType: 'modification' | 'termination', request?: RequestStatus) => {
    if (!request) {
      return requestType === 'modification' ? 'Demander modification' : 'Arrêt anticipé';
    }
    
    switch (request.status) {
      case 'pending':
        return `${requestType === 'modification' ? 'Modification' : 'Arrêt'} demandé`;
      case 'accepted':
        return `${requestType === 'modification' ? 'Modification' : 'Arrêt'} accepté`;
      case 'rejected':
        return `Renvoyer ${requestType === 'modification' ? 'modification' : 'arrêt'}`;
      default:
        return requestType === 'modification' ? 'Demander modification' : 'Arrêt anticipé';
    }
  };

  const canSendRequest = (request?: RequestStatus) => {
    return !request || request.status === 'rejected';
  };

  // Only show actions for owners
  if (userType !== 'owner' || contract.ownerId !== currentUserId) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} />}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Termination Request Button */}
        <div className="flex-1">
          <Button
            onClick={() => canSendRequest(terminationRequest) ? setShowTerminationDialog(true) : null}
            disabled={!canSendRequest(terminationRequest) || terminationRequestMutation.isPending}
            className={`w-full ${
              terminationRequest?.status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' :
              terminationRequest?.status === 'accepted' ? 'bg-green-600 hover:bg-green-700' :
              'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {getButtonText('termination', terminationRequest)}
            {terminationRequestMutation.isPending && (
              <RefreshCw className="w-3 h-3 ml-2 animate-spin" />
            )}
          </Button>
          
          {terminationRequest && (
            <div className="mt-2 flex items-center justify-between">
              {getRequestStatusBadge(terminationRequest.status, 'termination')}
              
              {/* Dropdown menu for request details */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate(`/tenant-requests/termination/${terminationRequest.id}`)}
                  >
                    Voir les détails
                  </DropdownMenuItem>
                  {terminationRequest.status === 'rejected' && (
                    <DropdownMenuItem
                      onClick={() => setShowTerminationDialog(true)}
                    >
                      Renvoyer la demande
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Modification Request Button */}
        <div className="flex-1">
          <Button
            onClick={() => canSendRequest(modificationRequest) ? setShowModificationDialog(true) : null}
            disabled={!canSendRequest(modificationRequest) || modificationRequestMutation.isPending}
            className={`w-full ${
              modificationRequest?.status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' :
              modificationRequest?.status === 'accepted' ? 'bg-green-600 hover:bg-green-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Edit className="w-4 h-4 mr-2" />
            {getButtonText('modification', modificationRequest)}
            {modificationRequestMutation.isPending && (
              <RefreshCw className="w-3 h-3 ml-2 animate-spin" />
            )}
          </Button>
          
          {modificationRequest && (
            <div className="mt-2 flex items-center justify-between">
              {getRequestStatusBadge(modificationRequest.status, 'modification')}
              
              {/* Dropdown menu for request details */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate(`/tenant-requests/modification/${modificationRequest.id}`)}
                  >
                    Voir les détails
                  </DropdownMenuItem>
                  {modificationRequest.status === 'rejected' && (
                    <DropdownMenuItem
                      onClick={() => setShowModificationDialog(true)}
                    >
                      Renvoyer la demande
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Termination Request Dialog */}
      <AlertDialog open={showTerminationDialog} onOpenChange={setShowTerminationDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Demande d'Arrêt Anticipé
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Demander l'arrêt anticipé de ce contrat. Le locataire recevra une notification 
                et pourra accepter ou refuser votre demande.
              </p>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="termination-reason" className="text-sm font-medium">
                    Raison de la résiliation *
                  </Label>
                  <Textarea
                    id="termination-reason"
                    placeholder="Expliquez la raison de votre demande d'arrêt anticipé..."
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Important :</strong> Si acceptée, la résiliation sera immédiate.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTerminationReason('')}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => terminationRequestMutation.mutate()}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={!terminationReason.trim() || terminationRequestMutation.isPending}
            >
              {terminationRequestMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modification Request Dialog */}
      <AlertDialog open={showModificationDialog} onOpenChange={setShowModificationDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Demande de Modification
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-sm">
                Demander une modification de ce contrat. Le locataire recevra une notification 
                et pourra accepter ou refuser votre demande.
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="modification-reason" className="text-sm font-medium">
                    Raison de la modification *
                  </Label>
                  <Textarea
                    id="modification-reason"
                    placeholder="Expliquez pourquoi vous souhaitez modifier le contrat..."
                    value={modificationReason}
                    onChange={(e) => setModificationReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Champs à modifier * (sélectionnez au moins un)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'tenant_name', label: 'Nom du locataire' },
                      { id: 'tenant_cin', label: 'CIN du locataire' },
                      { id: 'tenant_address', label: 'Adresse du locataire' },
                      { id: 'monthly_rent', label: 'Loyer mensuel' },
                      { id: 'deposit', label: 'Caution' },
                      { id: 'contract_duration', label: 'Durée du contrat' },
                      { id: 'special_conditions', label: 'Conditions spéciales' },
                      { id: 'payment_terms', label: 'Modalités de paiement' }
                    ].map((field) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFields([...selectedFields, field.id]);
                            } else {
                              setSelectedFields(selectedFields.filter(f => f !== field.id));
                            }
                          }}
                        />
                        <Label 
                          htmlFor={field.id} 
                          className="text-xs cursor-pointer"
                        >
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Note :</strong> Si acceptée, les modifications devront être re-signées.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setModificationReason('');
              setSelectedFields([]);
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => modificationRequestMutation.mutate()}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!modificationReason.trim() || selectedFields.length === 0 || modificationRequestMutation.isPending}
            >
              {modificationRequestMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}