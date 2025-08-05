import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, Bell, Heart, User, Search, LogOut, Home, Settings, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [, navigate] = useLocation();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    const email = localStorage.getItem("userEmail");
    const type = localStorage.getItem("userType");
    setIsAuthenticated(!!authStatus);
    setUserEmail(email || "");
    setUserType(type || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userType");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/");
  };

  const switchToTenant = () => {
    const tenantUser = {
      id: 2,
      userType: "tenant",
      username: "tenant1",
      firstName: "Marie",
      lastName: "Martin",
      email: "tenant@test.com"
    };
    localStorage.setItem("user", JSON.stringify(tenantUser));
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", "tenant@test.com");
    localStorage.setItem("userType", "tenant");
    console.log("Switched to tenant user:", tenantUser);
    setIsAuthenticated(true);
    setUserEmail("tenant@test.com");
    setUserType("tenant");
    window.location.reload(); // Refresh to update all components
  };

  const switchToOwner = () => {
    const ownerUser = {
      id: 1,
      userType: "owner",
      username: "owner1",
      firstName: "Pierre",
      lastName: "Durand",
      email: "owner@test.com"
    };
    localStorage.setItem("user", JSON.stringify(ownerUser));
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", "owner@test.com");
    localStorage.setItem("userType", "owner");
    setIsAuthenticated(true);
    setUserEmail("owner@test.com");
    setUserType("owner");
    window.location.reload(); // Refresh to update all components
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="gradient-button p-2 rounded-xl">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Ekrili
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Location intelligente
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/search" className="text-foreground hover:text-primary transition-colors font-medium">
              Découvrir
            </Link>
            <Link to="/search?filter=student" className="text-foreground hover:text-primary transition-colors font-medium">
              Pour étudiants
            </Link>
            <Link to="/search?filter=family" className="text-foreground hover:text-primary transition-colors font-medium">
              Pour familles
            </Link>
            {(userType === "owner" || !isAuthenticated) && (
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors font-medium">
                Louer mon bien
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <>
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex relative"
                  onClick={() => navigate("/notifications")}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-xs"></span>
                </Button>
                
                {/* Favorites */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex"
                  onClick={() => navigate("/favorites")}
                >
                  <Heart className="h-5 w-5" />
                </Button>

                {/* Messages */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex"
                  onClick={() => navigate("/messages")}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Button>
              </>
            )}

            {/* Search on mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => navigate("/search")}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {userEmail.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{userEmail}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {localStorage.getItem("userType") || "utilisateur"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/search")}>
                    Rechercher
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")}>
                    Messages
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => navigate("/favorites")}>
                     Favoris
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => navigate("/offers")}>
                     <FileText className="mr-2 h-4 w-4" />
                     {userType === "owner" ? "Offres reçues" : "Mes offres"}
                   </DropdownMenuItem>
                   {userType === "owner" && (
                     <>
                       <DropdownMenuItem onClick={() => navigate("/add-property")}>
                         <Home className="mr-2 h-4 w-4" />
                         Louer mon bien
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => navigate("/manage-properties")}>
                         <Settings className="mr-2 h-4 w-4" />
                         Gérer mes biens
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => navigate("/contracts")}>
                         <FileText className="mr-2 h-4 w-4" />
                         Contrats
                       </DropdownMenuItem>
                     </>
                   )}
                   <DropdownMenuItem onClick={() => navigate("/notifications")}>
                     <Bell className="mr-2 h-4 w-4" />
                     Notifications
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => navigate("/profile")}>
                     <User className="mr-2 h-4 w-4" />
                     Mon profil
                   </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Connexion
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate("/signup")}>
                  S'inscrire
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;