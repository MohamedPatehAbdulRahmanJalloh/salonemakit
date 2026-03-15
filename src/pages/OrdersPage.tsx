import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const OrdersPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <ClipboardList className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h2 className="text-lg font-bold">No Orders Yet</h2>
      <p className="text-sm text-muted-foreground mt-1">Your order history will appear here</p>
      <Link to="/search">
        <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
          Start Shopping
        </Button>
      </Link>
    </div>
  );
};

export default OrdersPage;
