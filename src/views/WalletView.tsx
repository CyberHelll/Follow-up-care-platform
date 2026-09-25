/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WalletCard } from '../components/WalletCard';

export const WalletView: React.FC = () => {
  return (
    <div id="wallet-view" className="space-y-4">
      <WalletCard />
    </div>
  );
};
