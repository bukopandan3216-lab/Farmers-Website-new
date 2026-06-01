import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                🌾
              </div>
              <span>FarmDirect</span>
            </div>
            <p className="text-muted-foreground">
              Connecting farmers directly to buyers. Fresh produce without the middleman.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Small 3-5% platform fee per order
            </p>
          </div>

          <div>
            <h4 className="mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/shop" className="hover:text-foreground transition-colors">Shop All</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/apply" className="hover:text-foreground transition-colors">Become a Seller</Link></li>
              <li><Link to="/stores" className="hover:text-foreground transition-colors">Featured Stores</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-foreground transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-foreground transition-colors">Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Contact Info</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>support@farmdirect.com</li>
              <li>sales@farmdirect.com</li>
              <li>+63 917 123 4567</li>
              <li>Mon-Sat: 8AM - 6PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2026 FarmDirect. All rights reserved. Direct from farm to table.</p>
        </div>
      </div>
    </footer>
  );
}
