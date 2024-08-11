// @ts-nocheck
/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import axios from "axios";
import { handle } from "frog/vercel";
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

const app = new Frog({
  // assetsPath: "/",
  basePath: "/api",
  title: "Frog Frame",
});

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

app.frame("/test", async (c) => {
  const { buttonValue, inputText, status } = c;

  const [{ access_token: accessToken }] = await runQuery(
    "select * from threads_url"
  );
  const POST1_URL = `https://graph.threads.net/v1.0/me/threads?fields=id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post&access_token=${accessToken}`;

  const response = await axios.get(POST1_URL);
  const threads = response.data.data;
  console.log("console threads");
  const threadPost = [threads[0]];

  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background:
            status === "response"
              ? "linear-gradient(to right, #432889, #17101F)"
              : "black",
          backgroundSize: "100% 100%",
          height: "100%",
          width: "100%",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "2em",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Your Latest Post from Threads
        </div>
        <ul
          style={{
            listStyleType: "none",
            maxWidth: "800px",
            margin: "0 auto",
            overflowY: "auto",
            maxHeight: "60vh",
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: "100%",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          {threadPost.map((thread) => (
            <li
              key={thread.id}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                margin: "10px 0",
                padding: "15px",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                color: "white",
              }}
            >
              <div style={{ fontSize: "1.2em", fontWeight: "bold" }}>
                {thread.username}
              </div>
              <div style={{ fontSize: "0.9em", color: "lightgray" }}>
                {new Date(thread.timestamp).toLocaleTimeString()}
              </div>

              <div style={{ fontSize: "1em", marginBottom: "10px" }}>
                {thread.text}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <span>❤️</span>
                  <span>💬</span>
                  <span>🔁</span>
                </div>
                <span>⋮</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
    intents: [
      <TextInput placeholder="Add your reply to this thread..." />,
      <Button value="apples">Like</Button>,
      <Button value="oranges">Comments</Button>,
      <Button value="bananas">Repost</Button>,
      status === "response" && <Button.Reset>Reset</Button.Reset>,
    ],
  });
});

// devtools(app, { serveStatic });

app.frame("/autopost", async (c) => {
  const { buttonValue, inputText, status } = c;
  const [{ access_token: accessToken }] = await runQuery(
    "select * from threads_url"
  );
  const POST1_URL = `https://graph.threads.net/v1.0/me/threads?fields=id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post&access_token=${accessToken}`;

  const response = await axios.get(POST1_URL);
  const threads = response.data.data;
  const threadPost = [threads[0]];
  console.log("console threads", threadPost);

  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background:
            status === "response"
              ? "linear-gradient(to right, #432889, #17101F)"
              : "black",
          backgroundSize: "100% 100%",
          height: "100%",
          width: "100%",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "2em",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Your Latest Post from Threads
        </div>
        <ul
          style={{
            listStyleType: "none",
            maxWidth: "800px",
            margin: "0 auto",
            overflowY: "auto",
            maxHeight: "60vh",
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: "100%",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          {threadPost.map((thread) => (
            <li
              key={thread.id}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                margin: "10px 0",
                padding: "15px",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                color: "white",
              }}
            >
              <div style={{ fontSize: "1.2em", fontWeight: "bold" }}>
                {thread.username}
              </div>
              <div style={{ fontSize: "0.9em", color: "lightgray" }}>
                {new Date(thread.timestamp).toLocaleTimeString()}
              </div>

              <div style={{ fontSize: "1em", marginBottom: "10px" }}>
                {thread.text}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <span>❤️</span>
                  <span>💬</span>
                  <span>🔁</span>
                </div>
                <span>⋮</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
    intents: [
      <TextInput placeholder="Add your reply to this thread..." />,
      <Button value="apples">Like</Button>,
      <Button value="oranges">Comments</Button>,
      <Button value="bananas">Repost</Button>,
      status === "response" && <Button.Reset>Reset</Button.Reset>,
    ],
  });
});

app.get("/cron", async (c) => {
  try {
    console.log("Running cron jobb");
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

    return c.res(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating routes:", error);
    return c.res(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    });
  }
});

// devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);

// NOTE: That if you are using the devtools and enable Edge Runtime, you will need to copy the devtools
// static assets to the public folder. You can do this by adding a script to your package.json:
// ```json
// {
//   scripts: {
//     "copy-static": "cp -r ./node_modules/frog/_lib/ui/.frog ./public/.frog"
//   }
// }
// ```
// Next, you'll want to set up the devtools to use the correct assets path:
// ```ts
// devtools(app, { assetsPath: '/.frog' })
// ```
