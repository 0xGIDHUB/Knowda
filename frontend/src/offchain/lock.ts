import { Asset, deserializeAddress, IWallet, mConStr0,} from "@meshsdk/core";
import { getScript, getTxBuilder, meshWallet } from "./common";
 
export async function lockAdaReward(amount: number, bWallet: IWallet) {
  const lovelaceAmount = ((amount + 1) * 1_000_000).toString();

  // these are the assets we want to lock into the contract  
  const assets: Asset[] = [
    {
      unit: "lovelace",
      quantity: lovelaceAmount,
    },
  ];
 
  // get utxo and wallet address
  const utxos = await bWallet.getUtxos();
  const bWalletAddress = await bWallet.getChangeAddress();

  const mWalletAddress = (await meshWallet.getUsedAddresses())[0];
 
  const { scriptAddr } = getScript();
 
  // hash of the public key of the wallet, to be used in the datum
  const signerHash = deserializeAddress(mWalletAddress).pubKeyHash;
 
  // build transaction with MeshTxBuilder
  const txBuilder = getTxBuilder();
  await txBuilder
    .txOut(scriptAddr, assets) // send assets to the script address
    .txOutDatumHashValue(mConStr0([signerHash])) // provide the datum where `"constructor": 0`
    .changeAddress(bWalletAddress) // send change back to the wallet address
    .selectUtxosFrom(utxos)
    .complete();


  const unsignedTx = txBuilder.txHex;
  
  const signedTx = await bWallet.signTx(unsignedTx);
  const txHash = await bWallet.submitTx(signedTx);

  return txHash;
}
 
