class ChainManager {
  static NETWORKS = {
    ETHEREUM: {
      id: 'eth',
      name: 'Ethereum',
      currency: 'ETH',
      network_type: 'evm_network',
      network_value: 'eth'
    },
    BSC: {
      id: 'bsc',
      name: 'Binance Smart Chain',
      currency: 'BNB',
      network_type: 'evm_network',
      network_value: 'bsc'
    },
    POLYGON: {
      id: 'matic',
      name: 'Polygon',
      currency: 'MATIC',
      network_type: 'evm_network',
      network_value: 'matic'
    }
  };

  static getNetworkType(networkId) {
    const network = Object.values(this.NETWORKS).find(n => n.id === networkId);
    return network ? network.network_type : null;
  }

  static getNetworkValue(networkId) {
    const network = Object.values(this.NETWORKS).find(n => n.id === networkId);
    return network ? network.network_value : null;
  }

  static validateNetwork(networkId) {
    return Object.values(this.NETWORKS).some(n => n.id === networkId);
  }

  static getNetworkCurrency(networkId) {
    const network = Object.values(this.NETWORKS).find(n => n.id === networkId);
    return network ? network.currency : null;
  }

  static getNetworkName(networkId) {
    const network = Object.values(this.NETWORKS).find(n => n.id === networkId);
    return network ? network.name : null;
  }
}

module.exports = { ChainManager }; 