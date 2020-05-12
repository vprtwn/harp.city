import Head from "next/head";
import Draggable from "react-draggable";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
// import "gun/lib/webrtc";
import Gun from "gun";

// Community relay peers: https://github.com/amark/gun/wiki/volunteer.dht
let peers = [
  "https://www.raygun.live/gun",
  "https://gunmeetingserver.herokuapp.com/gun",
  "https://gun-us.herokuapp.com/gun",
  "https://gun-eu.herokuapp.com/gun",
];
if (process.env.NODE_ENV === "development") {
  peers = ["http://localhost:8765/gun"];
}
const gun = Gun(peers);
let gunStore = null;

const PlacePage = (props: any) => {
  const [nodes, setNodes] = useState([]);

  const {
    query: { place },
  } = useRouter();

  if (place && !gunStore) {
    // initGun
    const version = "2020.5.11.0";
    const prefix = `harp.city.${process.env.NODE_ENV}.${version}`;
    const nodeName = `${prefix}^${place || ""}`;
    gunStore = gun.get(nodeName);
    gunStore.map().on((val, msgId) => {
      nodes[val.i] = {
        x: val.x,
        y: val.y,
      };
      console.log(JSON.stringify(nodes, null, 2));
      setNodes(JSON.parse(JSON.stringify(nodes)));
    });
  }

  return (
    <div>
      <base target="_blank" />
      <Head>
        <title>{place ?? "harp.city"}</title>
      </Head>
      <div className="w-screen">
        {nodes.map((node, i) => {
          return (
            <Draggable
              defaultClassName="react-draggable fixed"
              key={`draggable_${i}`}
              bounds="parent"
              position={{ x: node.x, y: node.y }}
              onDrag={(e, p) => {
                let newNodes = [];
                nodes.forEach((n, index) => {
                  newNodes[index] = n;
                });
                newNodes[i] = {
                  i: i,
                  x: p.x,
                  y: p.y,
                };
                setNodes(newNodes);
              }}
              onStop={(e, d) => {
                let node = nodes[i];
                gunStore.get(i).put(node);
              }}
            >
              <div className="cell border border-solid border-black">
                <div className="text-xs">{node.x}</div>
                <div className="text-xs">{node.y}</div>
                <div className="text-xs text-right">{i}</div>
              </div>
            </Draggable>
          );
        })}
        <button
          hidden={nodes.length > 10}
          className="fixed top-0 left-0 bg-black hover:bg-gray-500 text-white px-2 pb-1"
          onClick={() => {
            const i = nodes.length;
            const node = {
              i: i,
              x: 100,
              y: 100,
            };
            gunStore.get(i).put(node);
          }}
        >
          new
        </button>
        <div className="h-screen"></div>
        <div className="h-screen"></div>
      </div>
    </div>
  );
};

export default PlacePage;
