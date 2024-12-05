import React from "react";

export interface WalletWidgetProps {
  apiKey: string;
}

export const WalletWidget: React.FC<WalletWidgetProps> = ({ apiKey }) => {
  return (
    <div>
      <h1>Wallet Widget</h1>
    </div>
  );
};
