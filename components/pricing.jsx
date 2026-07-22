"use client";

import React from "react";
import { Card, CardContent } from "./ui/card";
import { PricingTable } from "@clerk/nextjs";

class PricingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-emerald-900/30 bg-muted/20">
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="text-sm">
              Pricing plans are not available yet. Please check back soon.
            </p>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

const Pricing = () => {
  return (
    <PricingErrorBoundary>
      <Card className="border-emerald-900/30 shadow-lg bg-gradient-to-b from-emerald-950/30 to-transparent">
        <CardContent className="p-6 md:p-8">
          <PricingTable
            checkoutProps={{
              appearance: {
                elements: {
                  drawerRoot: {
                    zIndex: 2000,
                  },
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </PricingErrorBoundary>
  );
};

export default Pricing;
