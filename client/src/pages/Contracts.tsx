import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Plus,
  Download,
  Eye,
  Edit,
  Send,
  Calendar,
  DollarSign,
  User,
  Home,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contracts = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userType, setUserType] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Mock contracts data
  const mockTenantContracts = [
    {
      id: 1,
      propertyTitle: "Studio moderne près INSAT",
      propertyLocation: "Ariana, Raoued",
      landlord: "Ahmed Karim",
      landlordPhone: "+216 98 765 432",
      startDate: "2024-02-01",
      endDate: "2024-08-01",
      monthlyRent: 450,
      deposit: 450,
      status: "Actif",
      signedDate: "2024-01-15",
      contractUrl: "/contracts/contract-001.pdf",
      paymentStatus: "À jour",
      nextPaymentDue: "2024-03-01"
    },
    {
      id: 2,
      propertyTitle: "Chambre étudiante",
      propertyLocation: "Tunis, Manouba",
      landlord: "Leila Mansouri",
      landlordPhone: "+216 55 123 456",
      startDate: "2023-09-01",
      endDate: "2024-06-30",
      monthlyRent: 380,
      deposit: 380,
      status: "En attente de signature",
      signedDate: null,
      contractUrl: "/contracts/contract-002.pdf",
      paymentStatus: "En attente",
      nextPaymentDue: "2024-03-01"
    }
  ];

  const mockOwnerContracts = [
    {
      id: 1,
      propertyTitle: "Villa familiale avec jardin",
      propertyLocation: "Sidi Bou Saïd",
      tenant: "Famille Gharbi",
      tenantPhone: "+216 22 333 444",
      startDate: "2023-01-01",
      endDate: "2024-12-31",
      monthlyRent: 1200,
      deposit: 1200,
      status: "Actif",
      signedDate: "2022-12-15",
      contractUrl: "/contracts/contract-villa-001.pdf",
      paymentStatus: "À jour",
      nextPaymentDue: "2024-03-01",
      totalRevenue: 14400
    },
    {
      id: 2,
      propertyTitle: "Studio étudiant meublé",
      propertyLocation: "Tunis, Manouba",
      tenant: "Amira Ben Said",
      tenantPhone: "+216 98 111 222",
      startDate: "2024-01-15",
      endDate: "2024-07-15",
      monthlyRent: 480,
      deposit: 480,
      status: "En cours de négociation",
      signedDate: null,
      contractUrl: "/contracts/contract-studio-002.pdf",
      paymentStatus: "En attente",
      nextPaymentDue: "2024-03-01",
      totalRevenue: 960
    }
  ];

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/login");
      return;
    }

    const type = localStorage.getItem("userType") || "";
    setUserType(type);

    // Load contracts based on user type
    if (type === "owner") {
      setContracts(mockOwnerContracts);
    } else {
      setContracts(mockTenantContracts);
    }
  }, [navigate]);

  const filteredContracts = contracts.filter(contract => {
    const searchField = userType === "owner" ? contract.tenant : contract.landlord;
    const matchesSearch = contract.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.propertyLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (searchField && searchField.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = !statusFilter || statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actif": return "success";
      case "En attente de signature": return "warning";
      case "En cours de négociation": return "secondary";
      case "Expiré": return "destructive";
      case "Résilié": return "outline";
      default: return "outline";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "À jour": return "success";
      case "En retard": return "destructive";
      case "En attente": return "warning";
      default: return "outline";
    }
  };

  const generateNewContract = () => {
    navigate("/create-contract");
  };

  const signContract = (contractId: number) => {
    const updatedContracts = contracts.map(contract => 
      contract.id === contractId 
        ? { ...contract, status: "Actif", signedDate: new Date().toISOString().split('T')[0] }
        : contract
    );
    setContracts(updatedContracts);
    
    toast({
      title: "Contrat signé",
      description: "Le contrat a été signé numériquement avec succès",
    });
  };

  const downloadContract = (contractUrl: string) => {
    // Mock download
    toast({
      title: "Téléchargement",
      description: "Le contrat PDF est en cours de téléchargement",
    });
  };

  const sendContractForSignature = (contractId: number) => {
    toast({
      title: "Contrat envoyé",
      description: "Le contrat a été envoyé pour signature numérique",
    });
  };

  // Calculate stats
  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === "Actif").length,
    pendingContracts: contracts.filter(c => c.status.includes("attente") || c.status.includes("négociation")).length,
    totalRevenue: userType === "owner" ? contracts.reduce((sum, c) => sum + (c.totalRevenue || 0), 0) : 0,
    monthlyPayments: contracts.filter(c => c.status === "Actif").reduce((sum, c) => sum + c.monthlyRent, 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <span>Mes Contrats</span>
            </h1>
            <p className="text-muted-foreground">
              {contracts.length} contrat(s) {userType === "owner" ? "propriétaire" : "locataire"}
            </p>
          </div>
          {userType === "owner" && (
            <Button onClick={generateNewContract} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouveau contrat</span>
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total contrats</p>
                  <p className="text-xl font-bold">{stats.totalContracts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                  <p className="text-xl font-bold">{stats.activeContracts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-xl font-bold">{stats.pendingContracts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {userType === "owner" ? "Revenus totaux" : "Paiements mensuels"}
                  </p>
                  <p className="text-xl font-bold">
                    {userType === "owner" ? stats.totalRevenue.toLocaleString() : stats.monthlyPayments.toLocaleString()} TND
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par propriété, locataire/propriétaire..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="en-attente">En attente de signature</SelectItem>
                  <SelectItem value="negociation">En cours de négociation</SelectItem>
                  <SelectItem value="expire">Expiré</SelectItem>
                  <SelectItem value="resilie">Résilié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contracts List */}
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <Card key={contract.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center space-x-2">
                          <Home className="h-4 w-4" />
                          <span>{contract.propertyTitle}</span>
                        </h3>
                        <p className="text-muted-foreground text-sm">{contract.propertyLocation}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(contract.status) as any}>
                          {contract.status}
                        </Badge>
                        <Badge variant={getPaymentStatusColor(contract.paymentStatus) as any}>
                          {contract.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {userType === "owner" ? "Locataire" : "Propriétaire"}
                        </p>
                        <p className="font-medium flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{userType === "owner" ? contract.tenant : contract.landlord}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {userType === "owner" ? contract.tenantPhone : contract.landlordPhone}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Période</p>
                        <p className="font-medium flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(contract.startDate).toLocaleDateString('fr-FR')} - {new Date(contract.endDate).toLocaleDateString('fr-FR')}</span>
                        </p>
                        {contract.signedDate && (
                          <p className="text-xs text-muted-foreground">
                            Signé le {new Date(contract.signedDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Montants</p>
                        <p className="font-medium flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{contract.monthlyRent} TND/mois</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Caution: {contract.deposit} TND
                        </p>
                      </div>
                    </div>

                    {/* Next Payment */}
                    {contract.status === "Actif" && (
                      <div className="p-3 glass-card rounded-lg mb-4">
                        <p className="text-sm font-medium">Prochain paiement</p>
                        <p className="text-xs text-muted-foreground">
                          Dû le {new Date(contract.nextPaymentDue).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadContract(contract.contractUrl)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/contract/${contract.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>

                    {contract.status === "En attente de signature" && (
                      <>
                        {userType === "owner" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sendContractForSignature(contract.id)}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Envoyer
                          </Button>
                        ) : (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => signContract(contract.id)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Signer
                          </Button>
                        )}
                      </>
                    )}

                    {contract.status === "Actif" && userType === "owner" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/messages?contact=${contract.tenant}`)}
                      >
                        <User className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter ? "Aucun contrat trouvé" : "Aucun contrat pour le moment"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter 
                ? "Essayez de modifier vos critères de recherche"
                : userType === "owner" 
                  ? "Créez votre premier contrat pour vos locataires"
                  : "Vos contrats de location apparaîtront ici"
              }
            </p>
            {!searchQuery && !statusFilter && userType === "owner" && (
              <Button onClick={generateNewContract} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Créer un contrat</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contracts;