import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search as SearchIcon, 
  MapPin, 
  Filter, 
  Heart, 
  Star, 
  Wifi, 
  Car, 
  GraduationCap,
  Users,
  Home,
  Maximize
} from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [, navigate] = useLocation();

  // Mock properties data
  const mockProperties = [
    {
      id: 1,
      title: "Studio moderne près INSAT",
      price: 450,
      priceType: "mois",
      location: "Ariana, Raoued",
      distance: "200m de l'INSAT",
      rating: 4.8,
      reviews: 24,
      type: "studio",
      amenities: ["wifi", "furnished", "parking"],
      images: ["/placeholder.svg"],
      isStudentFriendly: true,
      owner: "Ahmed Karim",
      available: true
    },
    {
      id: 2,
      title: "Appartement 2 pièces famille",
      price: 680,
      priceType: "mois",
      location: "Tunis, Bardo",
      distance: "5 min de l'école primaire",
      rating: 4.6,
      reviews: 18,
      type: "apartment",
      amenities: ["wifi", "garden", "security"],
      images: ["/placeholder.svg"],
      isFamilyFriendly: true,
      owner: "Fatma Ben Ali",
      available: true
    },
    {
      id: 3,
      title: "Villa avec jardin sécurisé",
      price: 1200,
      priceType: "mois",
      location: "Sidi Bou Saïd",
      distance: "10 min du centre",
      rating: 4.9,
      reviews: 32,
      type: "villa",
      amenities: ["wifi", "garden", "parking", "security"],
      images: ["/placeholder.svg"],
      isFamilyFriendly: true,
      owner: "Mohamed Trabelsi",
      available: true
    },
    {
      id: 4,
      title: "Studio étudiant meublé",
      price: 380,
      priceType: "mois",
      location: "Tunis, Manouba",
      distance: "300m de l'Université Manouba",
      rating: 4.3,
      reviews: 15,
      type: "studio",
      amenities: ["wifi", "furnished"],
      images: ["/placeholder.svg"],
      isStudentFriendly: true,
      owner: "Leila Mansouri",
      available: false
    }
  ];

  const [filteredProperties, setFilteredProperties] = useState(mockProperties);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation(position),
        (error) => console.log("Location access denied")
      );
    }
  }, []);

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position);
          // Filter properties within 5km radius (mock calculation)
          const nearbyProperties = mockProperties.filter(p => 
            p.location.includes("Tunis") || p.location.includes("Ariana")
          );
          setFilteredProperties(nearbyProperties);
          console.log("📍 Position trouvée:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Erreur de géolocalisation:", error);
          // Fallback to nearby properties
          const nearbyProperties = mockProperties.filter(p => 
            p.location.includes("Tunis") || p.location.includes("Ariana")
          );
          setFilteredProperties(nearbyProperties);
        }
      );
    }
  };

  const handleSearch = () => {
    let filtered = mockProperties;

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (propertyType && propertyType !== "all") {
      filtered = filtered.filter(p => p.type === propertyType);
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProperties(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, propertyType, priceRange]);

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi": return <Wifi className="h-4 w-4" />;
      case "parking": return <Car className="h-4 w-4" />;
      case "furnished": return <Home className="h-4 w-4" />;
      case "garden": return <span className="text-green-500">🌿</span>;
      case "security": return <span>🔒</span>;
      default: return <span>✓</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="glass-card p-6 mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-6">Trouvez votre lieu idéal</h1>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par ville, quartier, université..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={categoryFilter === "student" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(categoryFilter === "student" ? "" : "student")}
              >
                Pour étudiants
              </Button>
              <Button 
                variant={categoryFilter === "family" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(categoryFilter === "family" ? "" : "family")}
              >
                Pour familles
              </Button>
            </div>

            <Button 
              variant="outline" 
              onClick={handleLocationSearch}
              className="flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>📍 Me localiser</span>
            </Button>
            
            {/* Via Map Link */}
            <Button 
              variant="outline" 
              onClick={() => navigate("/map")}
              className="w-full md:w-auto"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Via Maps
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={propertyType === "studio" ? "default" : "outline"} 
              size="sm"
              onClick={() => setPropertyType(propertyType === "studio" ? "" : "studio")}
            >
              🎓 Étudiants
            </Button>
            <Button 
              variant={propertyType === "apartment" ? "default" : "outline"} 
              size="sm"
              onClick={() => setPropertyType(propertyType === "apartment" ? "" : "apartment")}
            >
              👨‍👩‍👧‍👦 Familles
            </Button>
            <Button variant="outline" size="sm">
              🏠 Meublé
            </Button>
            <Button variant="outline" size="sm">
              🚗 Parking
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Filtres avancés</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type de bien</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="apartment">Appartement</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Prix: {priceRange[0]} - {priceRange[1]} TND/mois
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={2000}
                    min={0}
                    step={50}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Équipements</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="wifi" />
                      <label htmlFor="wifi" className="text-sm">Wi-Fi inclus</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="furnished" />
                      <label htmlFor="furnished" className="text-sm">Meublé</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="parking" />
                      <label htmlFor="parking" className="text-sm">Parking</label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {filteredProperties.length} bien(s) trouvé(s)
          </h2>
          <Select defaultValue="price" onValueChange={(value) => {
            let sorted = [...filteredProperties];
            switch(value) {
              case "price":
                sorted.sort((a, b) => a.price - b.price);
                break;
              case "price-desc":
                sorted.sort((a, b) => b.price - a.price);
                break;
              case "rating":
                sorted.sort((a, b) => b.rating - a.rating);
                break;
              case "distance":
                // Mock distance sorting
                sorted.sort((a, b) => parseInt(a.distance) - parseInt(b.distance));
                break;
            }
            setFilteredProperties(sorted);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="rating">Mieux notés</SelectItem>
              <SelectItem value="distance">Plus proches</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card 
              key={property.id} 
              className="glass-card cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate(`/property/${property.id}`)}
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to favorites
                      const favorites = JSON.parse(localStorage.getItem("userFavorites") || "[]");
                      const isAlreadyFavorite = favorites.some((fav: any) => fav.id === property.id);
                      
                      if (!isAlreadyFavorite) {
                        const newFavorite = { ...property, addedToFavorites: new Date().toISOString() };
                        favorites.push(newFavorite);
                        localStorage.setItem("userFavorites", JSON.stringify(favorites));
                        console.log("❤️ Ajouté aux favoris:", property.title);
                      }
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  {!property.available && (
                    <Badge className="absolute bottom-2 left-2" variant="destructive">
                      Non disponible
                    </Badge>
                  )}
                  {property.isStudentFriendly && (
                    <Badge className="absolute top-2 left-2" variant="default">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Étudiant
                    </Badge>
                  )}
                  {property.isFamilyFriendly && (
                    <Badge className="absolute top-2 left-2" variant="default">
                      <Users className="h-3 w-3 mr-1" />
                      Famille
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                  <p className="text-primary font-bold text-xl mb-2">
                    {property.price} TND/{property.priceType}
                  </p>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{property.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <span className="text-accent">📍 {property.distance}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{property.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({property.reviews} avis)
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {getAmenityIcon(amenity)}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.amenities.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Par {property.owner}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun bien trouvé</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;