// @ts-nocheck

import axios from "axios";
import { runQuery } from "../lib/db";
import * as ed from "@noble/ed25519";
import { mnemonicToAccount, signTypedData } from "viem/accounts";
import {
  Message,
  NobleEd25519Signer,
  FarcasterNetwork,
  makeCastAdd,
} from "@farcaster/core";
import { hexToBytes } from "@noble/hashes/utils";

// Example URL and data to be used for route creation

let signer;

async function getSignedSig() {
  const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    name: "Farcaster SignedKeyRequestValidator",
    version: "1",
    chainId: 10,
    verifyingContract: "0x00000000fc700472606ed4fa22623acf62c60553",
  } as const;

  const SIGNED_KEY_REQUEST_TYPE = [
    { name: "requestFid", type: "uint256" },
    { name: "key", type: "bytes" },
    { name: "deadline", type: "uint256" },
  ] as const;

  /*** Generating a keypair ***/
  const privateKey = ed.utils.randomPrivateKey();
  console.log("console priv", privateKey);
  const publicKeyBytes = await ed.getPublicKeyAsync(privateKey);
  // signer = publicKeyBytes;
  console.log("console pub", publicKeyBytes);

  const key = "0x" + Buffer.from(publicKeyBytes).toString("hex");
  signer = privateKey;

  console.log("note this down", {
    publicKey: "0x" + Buffer.from(publicKeyBytes).toString("hex"),
    privateKey: "0x" + Buffer.from(privateKey).toString("hex"),
  });

  /*** Generating a Signed Key Request signature ***/
  const appFid = process.env.APP_FID;
  const account = mnemonicToAccount(process.env.APP_MNENOMIC);

  const deadline = Math.floor(Date.now() / 1000) + 86400; // signature is valid for 1 day
  const signature = await account.signTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: "SignedKeyRequest",
    message: {
      requestFid: appFid,
      key,
      deadline: deadline,
    },
  });

  const warpcastApi = "https://api.warpcast.com";
  const response = await axios.post(`${warpcastApi}/v2/signed-key-requests`, {
    key,
    requestFid: appFid,
    signature,
    deadline,
  });

  console.log(
    "result test",
    {
      key: process.env.FARCASTER_PUB_KEY,
      requestFid: appFid,
      signature,
      deadline,
    },
    response.data
  );
}

async function sendCast(message: string, parentUrl: string) {
  try {
    const dataOptions = {
      fid: 751009,
      network: FarcasterNetwork.MAINNET,
    };
    // const SIGNER = process.env.PRIVATE_KEY || "";
    const privateKeyBytes = new Uint8Array([
      156, 159, 88, 63, 132, 237, 27, 200, 141, 238, 146, 241, 29, 223, 96, 18,
      173, 118, 13, 56, 158, 3, 91, 176, 43, 28, 124, 174, 72, 139, 100, 5,
    ]);
    const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);
    console.log("ed25519Signer", ed25519Signer);
    const castBody = {
      text: message,
      embeds: [{ url: "https://openpost-sourcing.vercel.app/api/autopost" }],
      embedsDeprecated: [],
      mentions: [],
      mentionsPositions: [],
      parentUrl: parentUrl,
    };

    console.log(
      "castBody, dataOptions, ed25519Signer",
      castBody,
      dataOptions,
      ed25519Signer
    );
    const castAddReq = await makeCastAdd(castBody, dataOptions, ed25519Signer);
    console.log("castAddReq", castAddReq);
    const castAdd: any = castAddReq._unsafeUnwrap();

    console.log("console castAdd", castAdd);
    const messageBytes = Buffer.from(Message.encode(castAdd).finish());

    console.log("console messageBytes", messageBytes);

    const castRequest = await fetch(
      "https://hub.pinata.cloud/v1/submitMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: messageBytes,
      }
    );

    const castResult = await castRequest.json();
    console.log("castResult", castResult);

    return castResult;
  } catch (error) {
    console.log("problem sending cast:", error);
  }
}

export const GET = async (req: Request) => {
  try {
    console.log("Running cron job");
    // Call threads api
    const [{ access_token: accessToken, post_count: oldPostCounts }] =
      await runQuery("select * from threads_url");
    const POST1_URL = `https://graph.threads.net/v1.0/me/threads?fields=id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post&access_token=${accessToken}`;

    const response = await axios.get(POST1_URL);
    const currentPostCounts = response.data.data.length;

    if (oldPostCounts === currentPostCounts) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Get Latest Post
    const latestPost = response.data.data;

    await sendCast(
      "Check out my new post on Threads. Auto posted here using #OpenPost",
      "https://warpcast.com/"
    );

    console.log("updating post count");

    await runQuery(
      `Update  threads_url SET post_count=${oldPostCounts + 1} where id=1`
    );
    console.log("Cron job executed!");

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating routes:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
};
