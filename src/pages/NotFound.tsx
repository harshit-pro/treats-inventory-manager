import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="text-center bg-card/80 backdrop-blur-sm p-8 rounded-xl shadow-card">
        <h1 className="mb-2 text-6xl font-extrabold gradient-text">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">Oops! The page you are looking for does not exist.</p>
        <Link to="/">
          <Button className="bg-gradient-primary">Return Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
