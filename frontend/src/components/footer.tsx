import { Link } from "react-router-dom";
import Container from "./layout/Container";

export default function Footer() {
  return (
    <footer className="bg-background w-full border-t py-6">
      <Container className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center md:items-start">          <div className="flex items-center gap-2">
            <img src="/simple.svg" alt="Logo" className="h-8 w-8" />
            <Link to="/" className="font-logo text-xl font-normal text-[#2E7D32]">
              Hand Me Down
            </Link>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Connecting communities through sustainable giving
          </p>
        </div>
        <div className="flex flex-col gap-6 text-center md:flex-row md:gap-8 md:text-left">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/communities"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Communities
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Map
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
      <div className="container mt-6 border-t pt-6">
        <p className="text-muted-foreground text-center text-xs">
          © {new Date().getFullYear()} Hand Me Down. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
