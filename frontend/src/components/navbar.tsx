import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
import Container from "./layout/Container";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        {" "}
        <Link to="/" className="flex items-center gap-2">
          <img src="/simple.svg" alt="Logo" className="h-12 w-12" />
          <span className="font-logo text-2xl font-normal text-[#2E7D32]">
            Hand Me Down
          </span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium transition-colors hover:text-[#2E7D32]"
          >
            Home
          </Link>
          <Link
            to="/communities"
            className="text-sm font-medium transition-colors hover:text-[#2E7D32]"
          >
            Communities
          </Link>
          <Link
            to="/map"
            className="text-sm font-medium transition-colors hover:text-[#2E7D32]"
          >
            Map
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium transition-colors hover:text-[#2E7D32]"
          >
            About
          </Link>
        </nav>
        {/* Auth Buttons - Desktop */}
        <div className="hidden gap-4 md:flex">
          {isLoggedIn ? (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>My Account</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[200px] gap-3 p-4">
                      <Link
                        to="/profile"
                        className="hover:bg-muted block rounded-md p-2"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/conversations"
                        className="hover:bg-muted block rounded-md p-2"
                      >
                        Conversations
                      </Link>
                      <Link
                        to="/my-communities"
                        className="hover:bg-muted block rounded-md p-2"
                      >
                        My Communities
                      </Link>
                      <Link
                        to="/my-items"
                        className="hover:bg-muted block rounded-md p-2"
                      >
                        My Items
                      </Link>{" "}
                      <hr />
                      <Button
                        variant="ghost"
                        className="h-auto justify-start p-2 font-normal"
                        onClick={() => signOut()}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-background border-b p-4 pt-0 md:hidden">
          <nav className="flex flex-col gap-4 py-4">
            <Link
              to="/"
              className="hover:bg-muted rounded-md p-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/communities"
              className="hover:bg-muted rounded-md p-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Communities
            </Link>
            <Link
              to="/map"
              className="hover:bg-muted rounded-md p-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Map
            </Link>
            <Link
              to="/about"
              className="hover:bg-muted rounded-md p-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <hr />
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="hover:bg-muted rounded-md p-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/conversations"
                  className="hover:bg-muted rounded-md p-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Conversations
                </Link>
                <Link
                  to="/my-communities"
                  className="hover:bg-muted rounded-md p-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Communities
                </Link>
                <Link
                  to="/my-items"
                  className="hover:bg-muted rounded-md p-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Items
                </Link>{" "}
                <Button
                  variant="ghost"
                  className="h-auto justify-start p-2 font-normal"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-[#2E7D32] hover:bg-[#1B5E20]"
                >
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
