export const getNftContractAddress = (networkId: number) => {
  if (networkId == 80001) return process.env.NFT_CONTRACT_ADDRESS_MATIC_MUMBAI;
  else return process.env.NFT_CONTRACT_ADDRESS_LOCAL;
};
