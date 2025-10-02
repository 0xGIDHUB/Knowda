import {
  BlockfrostProvider,
  MeshTxBuilder,
  MeshWallet,
  serializePlutusScript,
  UTxO,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-cst";
import blueprint from "./plutus.json";
 
const blockchainProvider = new BlockfrostProvider(process.env.BLOCKFROST_PROVIDER!);
 
// wallet for signing transactions
export const meshWallet = new MeshWallet({
  networkId: 0,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: "root",
    bech32: "xprv1uqgu6kdelwsjscsmrglzg3y6vlc7lfqv44rv2l3cvhv6xkk6s30xz3l4ej3s4wkae3t20eq2zstqw755n3stha0jcxt53qdygphd2m7qcla6t576tflhx6a8w773qstflk2vsg9h5nqk94esel3s7l54ey834fzv",
  },
});

// reusable function to get the script and address from the blueprint (plutus.json)
export function getScript() {
  const scriptCbor = applyParamsToScript(
    blueprint.validators[0].compiledCode,
    []
  );
 
  const scriptAddr = serializePlutusScript(
    { code: scriptCbor, version: "V3" },
  ).address;
 
  return { scriptCbor, scriptAddr };
}

// reusable function to get a transaction builder
export function getTxBuilder() {
  return new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
  });
}
 
// reusable function to get a UTxO by transaction hash
export async function getUtxoByTxHash(txHash: string): Promise<UTxO> {
  const utxos = await blockchainProvider.fetchUTxOs(txHash);
  if (utxos.length === 0) {
    throw new Error("UTxO not found");
  }
  return utxos[0];
}