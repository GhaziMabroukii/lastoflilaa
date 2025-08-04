import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ContractStatusBadge } from "@/components/ContractStatusBadge";
import { NotificationCenter } from "@/components/NotificationCenter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Plus, Eye, Edit } from "lucide-react";

interface Contract {
  id: number;
  status: string;
  contractData: any;
  tenantSignDeadline?: string | null;
  createdAt: string;
  ownerId: number;
  tenantId: number;
  ownerSignature?: string | null;
  tenantSignature?: string | null;
  ownerSignedAt?: string | null;
  tenantSignedAt?: string | null;
}

export default function ContractsDashboard() {
  const [, navigate] = useLocation();
  const currentUserId = 1; // Should come from auth context

  // Fetch user's contracts
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['/api/contracts', currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/contracts?userId=${currentUserId}&ownerOnly=true`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const getContractTitle = (contract: Contract) => {
    return contract.contractData?.propertyTitle || `Contrat #${contract.id}`;
  };

  const getContractRole = (contract: Contract) => {
    return contract.ownerId === currentUserId ? 'Propriétaire' : 'Locataire';
  };

  const canModifyContract = (contract: Contract) => {
    // Owner can modify if:
    // 1. They are the owner
    // 2. Tenant hasn't signed yet
    // 3. Contract is not expired or cancelled
    return contract.ownerId === currentUserId && 
           !contract.tenantSignature && 
           !['expired', 'cancelled'].includes(contract.status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'owner_signed': return 'text-yellow-600';
      case 'fully_signed': return 'text-blue-600';
      case 'expired': return 'text-red-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes Contrats</h1>
          <p className="text-muted-foreground">
            Gérez vos contrats de location et suivez leur statut
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/notifications")}>
            Notifications
          </Button>
          <Button onClick={() => navigate("/create-contract")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Contrat
          </Button>
        </div>
      </div>

      {contracts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun contrat trouvé</h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore de contrats. Créez votre premier contrat pour commencer.
            </p>
            <Button onClick={() => navigate("/create-contract")}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un contrat
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">
                        {getContractTitle(contract)}
                      </CardTitle>
                      <ContractStatusBadge 
                        status={contract.status} 
                        tenantSignDeadline={contract.tenantSignDeadline}
                      />
                      <Badge variant="outline" className="text-xs">
                        {getContractRole(contract)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Contrat #{contract.id}</span>
                      <span>Créé le {format(new Date(contract.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                      {contract.tenantSignDeadline && contract.status === 'owner_signed' && (
                        <span className="text-yellow-600 font-medium">
                          Échéance: {format(new Date(contract.tenantSignDeadline), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/contract/${contract.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    {canModifyContract(contract) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/create-contract?edit=${contract.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {contract.contractData?.propertyAddress && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    📍 {contract.contractData.propertyAddress}
                  </p>
                  {contract.contractData?.monthlyRent && (
                    <p className="text-sm font-medium mt-1">
                      💰 {contract.contractData.monthlyRent}€/mois
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Actifs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {contracts.filter(c => c.status === 'owner_signed').length}
            </div>
            <div className="text-sm text-muted-foreground">En attente</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.filter(c => c.status === 'fully_signed').length}
            </div>
            <div className="text-sm text-muted-foreground">Signés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {contracts.filter(c => c.status === 'expired').length}
            </div>
            <div className="text-sm text-muted-foreground">Expirés</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}