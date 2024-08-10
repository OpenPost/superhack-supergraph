// @ts-nocheck
/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
// import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import axios from "axios";
import { handle } from "frog/vercel";

const app = new Frog({
  // assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Frog Frame",
});

const threads_access_token =
  "THQWJYTGVpYVh1R1lhemdOWWFQdHdDVC1NX3hVQlk1dkt4Mi02aHRobUEzZAGhGVVdaUFNzSzNBa2Jva2pHMFM2Y1FaelVZAemFkZAG0wVTZAnTUs5b0tqUzkyZAGpMQjVEc3cxRW5VVVJ5U09BeEhnNGdreC1oU3puS1FXRjFQYlNNWHNiS3ZAMLXlvb2lEcUQtSHBTMFEZD";

const POST1_URL =
  "https://graph.threads.net/v1.0/me/threads?fields=id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post&access_token=THQWJYTGVpYVh1R1lhemdOWWFQdHdDVC1NX3hVQlk1dkt4Mi02aHRobUEzZAGhGVVdaUFNzSzNBa2Jva2pHMFM2Y1FaelVZAemFkZAG0wVTZAnTUs5b0tqUzkyZAGpMQjVEc3cxRW5VVVJ5U09BeEhnNGdreC1oU3puS1FXRjFQYlNNWHNiS3ZAMLXlvb2lEcUQtSHBTMFEZD";

app.frame("/test", async (c) => {
  console.log("Frame /post1 accessed");
  const { buttonValue, inputText, status } = c;
  const response = await axios.get(POST1_URL);
  const threads = response.data.data;
  console.log("console threads", threads);

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
          {threads.map((thread) => (
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

app.frame("/random", async (c) => {
  const { buttonValue, inputText, status } = c;
  const response = await axios.get(POST1_URL);
  const threads = response.data.data;
  console.log("console threads", threads);

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
          {threads.map((thread) => (
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
