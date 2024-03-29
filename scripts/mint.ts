import { loadSync as loadEnvSync } from "https://deno.land/std/dotenv/mod.ts"
import { getFullnodeUrl, SuiClient } from 'npm:@mysten/sui.js/client';
import { Ed25519Keypair } from 'npm:@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from 'npm:@mysten/sui.js/transactions';

const env = loadEnvSync();
const secret_key_mnemonics = env.SECRET_KEY_ED25519_1_MNEMONICS;
const keypair = Ed25519Keypair.deriveKeypair(secret_key_mnemonics);
console.log(keypair.getPublicKey().toSuiAddress())

const client = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

const PACKAGE_ID = env.MovescriptionPackageId;
const TICKRECORD_ID = env.MovescriptionTicketRecordId;
const tick = 'MOVE';

const mint_fee = 0.1 * 1_000_000_000; // 1 SUI = 1_000_000_000 MIST

const txb = new TransactionBlock();
const [coin] = txb.splitCoins(txb.gas, [mint_fee]);
txb.moveCall({
	target: `${PACKAGE_ID}::movescription::mint`,
	arguments: [txb.object(TICKRECORD_ID), txb.pure(tick), coin, txb.object('0x6')],
});
txb.setSender(keypair.getPublicKey().toSuiAddress());

const result = await client.signAndExecuteTransactionBlock({
	transactionBlock: txb,
	signer: keypair,
	requestType: 'WaitForLocalExecution',
	options: {
		showEffects: true,
	},
});
console.log(result);