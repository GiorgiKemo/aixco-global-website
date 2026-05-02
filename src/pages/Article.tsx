import { Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { aixcoLivePath } from "@/lib/aixco-live-assets";

const articleRedirects: Record<string, string> = {
  "7-percent-annual-property-growth": aixcoLivePath("annual-property-growth-batumi.html"),
  "black-sea-corridor": aixcoLivePath("black-sea-corridor-batumi-report.html"),
  "from-volatility-to-opportunity": aixcoLivePath("from-volatility-to-opportunity-batumi.html"),
  "40-percent-down-payment-guide": aixcoLivePath("batumi-property-40-percent-down-v2.html"),
  "short-term-rentals": aixcoLivePath("short-term-rentals-batumi-full.html"),
  "50k-gateway-property": aixcoLivePath("50k-gateway-european-coastal-property.html"),
  "tourism-led-real-estate": aixcoLivePath("tourism-led-real-estate-batumi.html"),
  "8-12-rental-yield": aixcoLivePath("high-rental-yield-coastal-real-estate.html"),
  "secondary-coastal-cities": aixcoLivePath("why-capital-secondary-coastal-cities.html"),
  "batumi-rental-market": aixcoLivePath("batumi-short-term-rentals.html"),
};

export default function Article() {
  const { slug } = useParams();
  const target = slug ? articleRedirects[slug] : undefined;

  useEffect(() => {
    if (target) window.location.replace(target);
  }, [target]);

  if (!target) return <Navigate to="/insights" replace />;
  return null;
}
