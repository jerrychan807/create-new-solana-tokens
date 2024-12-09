import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { base58 } from '@metaplex-foundation/umi/serializers';
import {
  mintV1,
  createFungibleAsset,
  mplTokenMetadata,
  createV1,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';
import fs from 'fs';
import {
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  signerIdentity,
  some,
  publicKey,
} from '@metaplex-foundation/umi';
import dotenv from 'dotenv';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import {
  RPC_ENDPOINT,
  creatorWallet,
  payerWallet,
  solanaConnection,
} from './constants';
import chalk from 'chalk';

dotenv.config();

async function createSemiFungibleToken(
  rpcEndpoint: string,
  wallet: Keypair,
  payerWallet: Keypair,
) {
  try {
    const umi = createUmi(rpcEndpoint, 'confirmed').use(mplTokenMetadata());
    console.log(chalk.green(`rpcEndpoint, ${rpcEndpoint}`));

    // 导入私钥,管理员钱包
    const adminsigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(wallet));
    console.log(chalk.green(`adminsigner address, ${adminsigner.publicKey}`));

    // 导入私钥,用户钱包
    const payersigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(payerWallet));
    console.log(chalk.green(`payersigner address, ${payersigner.publicKey}`));

    umi.use(signerIdentity(payersigner, true));
   
    // 随机生成一个地址
    const mintSigner = generateSigner(umi);
    console.log(chalk.green(`mint address, ${mintSigner.publicKey}`));

    // const creation = await createV1(umi, {
    //   mint: mintSigner,
    //   name: token_info.token_name,
    //   uri: token_info.uri ?? '',
    //   sellerFeeBasisPoints: percentAmount(1),
    //   decimals: some(token_info.token_decimals),
    //   tokenStandard: TokenStandard.FungibleAsset,
    // }).sendAndConfirm(umi)

    // 定义token数据
    const token_info = {
      token_name: 'FirstSFT',
      token_symbol: 'FSFT',
      description: `FirstSFT demo`,
      uri: 'https://raw.githubusercontent.com/jerrychan807/crypto-young-nft/refs/heads/main/resource/sft_example.json', //CHANGE TO YOUR OWN URI
      token_decimals: 0
    }

    const creation = await createFungibleAsset(umi, {
      mint: mintSigner, // 代币地址
      authority: adminsigner, 
      name: token_info.token_name,
      symbol: token_info.token_symbol,
      uri: token_info.uri,
      sellerFeeBasisPoints: percentAmount(1),
      decimals: some(token_info.token_decimals),
    }).sendAndConfirm(umi)

    const signature = base58.deserialize(creation.signature)[0];

    console.log(
      chalk.green(
      `token ${token_info.token_name} created successfully...
      signature: ${signature}
      address: ${mintSigner.publicKey}
    `
      )
    );

  } catch (error) {
    console.log(chalk.red(`error minting token: ${error}`));
  }
}


createSemiFungibleToken(RPC_ENDPOINT, creatorWallet, payerWallet);
