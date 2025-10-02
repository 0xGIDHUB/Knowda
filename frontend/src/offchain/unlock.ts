import {
  deserializeAddress,
  mConStr0,
} from "@meshsdk/core";
import { getScript, getTxBuilder, getUtxoByTxHash, meshWallet } from "./common";

async function main() {
  // get utxo, collateral and address from wallet
  const utxos = await meshWallet.getUtxos();
  const walletAddress = (await meshWallet.getUsedAddresses())[0];
  const collateral = (await meshWallet.getCollateral())[0];

  const { scriptCbor } = getScript();
 
  // hash of the public key of the wallet, to be used in the datum
  const signerHash = deserializeAddress(walletAddress).pubKeyHash;
  // redeemer value to unlock the funds
  const amount = 10000000;
 
  // get the utxo from the script address of the locked funds
  const txHashFromDesposit = process.argv[2];
  const scriptUtxo = await getUtxoByTxHash(txHashFromDesposit);


  // build transaction with MeshTxBuilder
  const txBuilder = getTxBuilder();
  await txBuilder
    .spendingPlutusScriptV3() // we used plutus v3
    .txIn( // spend the utxo from the script address
      scriptUtxo.input.txHash,
      scriptUtxo.input.outputIndex,
      scriptUtxo.output.amount,
      scriptUtxo.output.address
    )
    .txInScript(scriptCbor)
    .txInRedeemerValue(mConStr0([amount])) // provide the required redeemer value
    .txInDatumValue(mConStr0([signerHash])) // only the owner of the wallet can unlock the funds
    .requiredSignerHash(signerHash)
    .changeAddress(walletAddress) // Destination address for the unlocked utxo
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    )
    .selectUtxosFrom(utxos)
    .complete();
  const unsignedTx = txBuilder.txHex;
 
  const signedTx = await meshWallet.signTx(unsignedTx);
  const txHash = await meshWallet.submitTx(signedTx);
  console.log(`10 tADA unlocked from the contract at Tx ID: ${txHash}`);

}

main();
