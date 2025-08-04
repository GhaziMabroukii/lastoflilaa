import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ContractGenerator from "@/components/ContractGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const CreateContract = () => {
  const [contractData, setContractData] = useState({
    offerId: "",
    propertyId: "",
    tenantName: "",
    tenantEmail: "",
    tenantPhone: "",
    tenantCin: "",
    ownerCin: "",
    ownerId: "1", // Mock owner ID - should come from auth
    startDate: "",
    endDate: "",
    monthlyRent: "",
    deposit: "",
    conditions: ""
  });
  
  const [showSignatureStep, setShowSignatureStep] = useState(false);
  const [createdContract, setCreatedContract] = useState(null);
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || '{"id": 1, "userType": "owner"}');

  // Sign contract mutation for owner signature during creation
  const signContract = useMutation({
    mutationFn: async (signatureData: any) => {
      return await apiRequest(`/api/contracts/${createdContract?.id}/sign`, {
        method: "PUT",
        body: JSON.stringify(signatureData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${createdContract?.id}`] });
      toast({
        title: "Contrat signé",
        description: "Votre signature a été enregistrée. Le contrat est maintenant en attente de la signature du locataire."
      });
      // Force refresh the contract data and navigate
      queryClient.removeQueries({ queryKey: [`/api/contracts/${createdContract?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts`] });
      
      // Navigate immediately after invalidation
      navigate(`/contract/${createdContract?.id}`, { replace: true });
    },
    onError: (error) => {
      toast({
        title: "Erreur de signature",
        description: "Impossible de signer le contrat. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });

  // Fetch accepted offers requesting contracts for the current owner
  const { data: contractRequests = [] } = useQuery({
    queryKey: ["/api/offers", currentUser.id, "received"],
    queryFn: () => apiRequest(`/api/offers?userId=${currentUser.id}&type=received`),
    select: (data) => data.filter((offer: any) => offer.status === 'contract_requested')
  });

  // Create contract mutation
  const createContract = useMutation({
    mutationFn: async (contractData: any) => {
      return await apiRequest("/api/contracts", {
        method: "POST",
        body: JSON.stringify(contractData)
      });
    },
    onSuccess: (contract) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setCreatedContract(contract);
      setShowSignatureStep(true);
      toast({
        title: "Contrat créé",
        description: "Signez maintenant le contrat pour l'activer.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le contrat. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    // Mock authentication check - should be replaced with real auth
    const isAuth = true; // localStorage.getItem("isAuthenticated");
    const userType = "owner"; // localStorage.getItem("userType");
    
    if (!isAuth) {
      navigate("/login");
      return;
    }
    
    if (userType !== "owner") {
      toast({
        title: "Accès refusé",
        description: "Seuls les propriétaires peuvent créer des contrats",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }
  }, [navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setContractData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show signature step after contract creation
  if (showSignatureStep && createdContract) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => {
              setShowSignatureStep(false);
              setCreatedContract(null);
            }}
            className="mb-6 flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>

          <div className="text-center mb-8">
            <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Signer le contrat
            </h1>
            <p className="text-muted-foreground mt-2">
              Signez le contrat pour l'activer. Le locataire recevra ensuite une notification pour signer à son tour.
            </p>
          </div>

          <ContractGenerator 
            contract={createdContract}
            onSign={(signatureData) => signContract.mutate(signatureData)}
            isLoading={signContract.isPending}
            currentUserId={1}
          />
        </div>
      </div>
    );
  }

  const generateContract = () => {
    if (!contractData.propertyId || !contractData.tenantName || !contractData.tenantEmail ||
        !contractData.tenantCin || !contractData.ownerCin ||
        !contractData.startDate || !contractData.endDate || !contractData.monthlyRent) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const selectedProperty = properties.find((p: any) => p.id.toString() === contractData.propertyId);
    
    const contractPayload = {
      offerId: 1, // Mock offer ID - should be from an actual offer
      propertyId: parseInt(contractData.propertyId),
      tenantId: 2, // Mock tenant ID - should be created or found based on tenant details
      ownerId: parseInt(contractData.ownerId),
      contractData: {
        propertyTitle: selectedProperty?.title || "Propriété",
        propertyAddress: selectedProperty?.address || "Adresse",
        landlordName: "Ahmed Ben Ali", // Should come from owner data
        landlordCin: contractData.ownerCin,
        tenantName: contractData.tenantName,
        tenantEmail: contractData.tenantEmail,
        tenantPhone: contractData.tenantPhone,
        tenantCin: contractData.tenantCin,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        monthlyRent: parseFloat(contractData.monthlyRent),
        deposit: parseFloat(contractData.deposit || contractData.monthlyRent),
        conditions: contractData.conditions
      }
    };

    createContract.mutate(contractPayload);
  };

  if (contractRequests.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/contracts")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <span>Créer un nouveau contrat</span>
              </h1>
            </div>
          </div>

          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune demande de contrat</h3>
            <p className="text-muted-foreground mb-6">
              Vous devez d'abord recevoir des offres acceptées où les locataires demandent un contrat.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/offers")}>
                Voir mes offres reçues
              </Button>
              <Button variant="outline" onClick={() => navigate("/manage-properties")}>
                Gérer mes propriétés
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/contracts")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <span>Créer un nouveau contrat</span>
            </h1>
            <p className="text-muted-foreground">
              Choisissez une demande de contrat pour commencer
            </p>
          </div>
        </div>

        {/* Contract Requests List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Demandes de contrat en attente</h2>
          <div className="grid gap-4">
            {contractRequests.map((offer: any) => (
              <Card key={offer.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Propriété #{offer.propertyId}</h3>
                      <p className="text-sm text-muted-foreground">
                        Demande de locataire #{offer.tenantId}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setContractData(prev => ({
                          ...prev,
                          offerId: offer.id.toString(),
                          propertyId: offer.propertyId.toString(),
                          startDate: offer.startDate.split('T')[0],
                          endDate: offer.endDate.split('T')[0],
                          monthlyRent: offer.monthlyRent.toString(),
                          deposit: offer.deposit?.toString() || "",
                        }));
                      }}
                    >
                      Créer le contrat
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Loyer mensuel</p>
                      <p className="text-lg font-bold text-primary">{offer.monthlyRent} TND</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Période</p>
                      <p className="text-sm">{new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contract Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Informations du contrat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Selection */}
              <div>
                <Label htmlFor="property">Propriété *</Label>
                <Select value={contractData.propertyId} onValueChange={(value) => handleInputChange("propertyId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une propriété" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.title} - {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tenant Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenantName">Nom du locataire *</Label>
                  <Input
                    id="tenantName"
                    value={contractData.tenantName}
                    onChange={(e) => handleInputChange("tenantName", e.target.value)}
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="tenantEmail">Email *</Label>
                  <Input
                    id="tenantEmail"
                    type="email"
                    value={contractData.tenantEmail}
                    onChange={(e) => handleInputChange("tenantEmail", e.target.value)}
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenantPhone">Téléphone</Label>
                  <Input
                    id="tenantPhone"
                    value={contractData.tenantPhone}
                    onChange={(e) => handleInputChange("tenantPhone", e.target.value)}
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
                <div>
                  <Label htmlFor="tenantCin">CIN Locataire *</Label>
                  <Input
                    id="tenantCin"
                    value={contractData.tenantCin}
                    onChange={(e) => handleInputChange("tenantCin", e.target.value)}
                    placeholder="12345678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ownerCin">CIN Propriétaire *</Label>
                <Input
                  id="ownerCin"
                  value={contractData.ownerCin}
                  onChange={(e) => handleInputChange("ownerCin", e.target.value)}
                  placeholder="87654321"
                />
              </div>

              {/* Contract Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={contractData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Date de fin *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={contractData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyRent">Loyer mensuel (TND) *</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={contractData.monthlyRent}
                    onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                    placeholder="450"
                  />
                </div>
                <div>
                  <Label htmlFor="deposit">Caution (TND)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={contractData.deposit}
                    onChange={(e) => handleInputChange("deposit", e.target.value)}
                    placeholder="450"
                  />
                </div>
              </div>

              {/* Special Terms */}
              <div>
                <Label htmlFor="conditions">Conditions particulières</Label>
                <Textarea
                  id="conditions"
                  value={contractData.conditions}
                  onChange={(e) => handleInputChange("conditions", e.target.value)}
                  placeholder="Ajoutez des conditions spéciales si nécessaire..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contract Preview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Aperçu du contrat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="text-center font-bold text-lg mb-6">
                  CONTRAT DE LOCATION
                </div>
                
                <div>
                  <strong>Propriété:</strong> {properties.find((p: any) => p.id.toString() === contractData.propertyId)?.title || "Non sélectionnée"}
                </div>
                
                <div>
                  <strong>Locataire:</strong> {contractData.tenantName || "Non renseigné"}
                </div>
                
                <div>
                  <strong>Email:</strong> {contractData.tenantEmail || "Non renseigné"}
                </div>
                
                <div>
                  <strong>CIN Locataire:</strong> {contractData.tenantCin || "Non renseigné"}
                </div>
                
                <div>
                  <strong>CIN Propriétaire:</strong> {contractData.ownerCin || "Non renseigné"}
                </div>
                
                <div>
                  <strong>Période:</strong> {contractData.startDate ? new Date(contractData.startDate).toLocaleDateString('fr-FR') : "Non renseignée"} 
                  {contractData.endDate ? ` au ${new Date(contractData.endDate).toLocaleDateString('fr-FR')}` : ""}
                </div>
                
                <div>
                  <strong>Loyer mensuel:</strong> {contractData.monthlyRent ? `${contractData.monthlyRent} TND` : "Non renseigné"}
                </div>
                
                <div>
                  <strong>Caution:</strong> {contractData.deposit || contractData.monthlyRent ? `${contractData.deposit || contractData.monthlyRent} TND` : "Non renseignée"}
                </div>

                {contractData.conditions && (
                  <div>
                    <strong>Conditions particulières:</strong>
                    <p className="mt-1 text-muted-foreground">{contractData.conditions}</p>
                  </div>
                )}

                <div className="mt-8 p-4 glass-card rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Ce contrat sera envoyé par email au locataire pour signature numérique sécurisée.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline" onClick={() => navigate("/contracts")}>
            Annuler
          </Button>
          <Button onClick={generateContract} className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Générer et envoyer le contrat</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateContract;