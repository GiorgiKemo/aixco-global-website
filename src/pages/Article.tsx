import { Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";

const articleRedirects: Record<string, string> = {
  "7-percent-annual-property-growth": "/aixco-global-op2/annual-property-growth-batumi.html",
  "black-sea-corridor": "/aixco-global-op2/black-sea-corridor-batumi-report.html",
  "from-volatility-to-opportunity": "/aixco-global-op2/from-volatility-to-opportunity-batumi.html",
  "40-percent-down-payment-guide": "/aixco-global-op2/batumi-property-40-percent-down-v2.html",
  "short-term-rentals": "/aixco-global-op2/short-term-rentals-batumi-full.html",
  "50k-gateway-property": "/aixco-global-op2/50k-gateway-european-coastal-property.html",
  "tourism-led-real-estate": "/aixco-global-op2/tourism-led-real-estate-batumi.html",
  "8-12-rental-yield": "/aixco-global-op2/high-rental-yield-coastal-real-estate.html",
  "secondary-coastal-cities": "/aixco-global-op2/why-capital-secondary-coastal-cities.html",
  "batumi-rental-market": "/aixco-global-op2/batumi-short-term-rentals.html",
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
