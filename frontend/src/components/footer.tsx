import {Link} from "react-router-dom"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <Link to="/" className="text-xl font-bold text-[#2E7D32]">
            Hand Me Down
          </Link>
          <p className="text-sm text-muted-foreground mt-1">Connecting communities through sustainable giving</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/communities" className="text-muted-foreground hover:text-foreground transition-colors">
                  Communities
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                  Map
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mt-6 pt-6 border-t">
        <p className="text-xs text-center text-muted-foreground">
          © {new Date().getFullYear()} Hand Me Down. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
