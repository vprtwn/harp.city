import Head from "next/head";
import Draggable from "react-draggable";
import { useRouter } from "next/router";
import { midiToName, midiToTuningSymbol, pxToMidi } from "../utils/transforms";
import React, { useEffect, useRef, useState } from "react";
import Gun from "gun";
import "gun/lib/webrtc";
import Tone from "tone";

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
      setNodes(JSON.parse(JSON.stringify(nodes)));
    });
  }

  return (
    <div>
      <base target="_blank" />
      <Head>
        <title>{place ?? "harp.city"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="canvas border border-solid border-black">
        {nodes.map((node, i) => {
          return (
            <Draggable
              defaultClassName="react-draggable absolute"
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
                node.d = false;
                gunStore.get(i).put(node);
              }}
            >
              <div
                className={`cell border-solid border-black bg-white ${
                  !midiToTuningSymbol(pxToMidi(node.y)) ? "border-2" : "border"
                }`}
              >
                <div className="pl-1">
                  <span className="text-xs">{midiToName(pxToMidi(node.y))}</span>
                  <sup className="text-xxs">{midiToTuningSymbol(pxToMidi(node.y))}</sup>
                </div>
                <div className="text-xs">{node.x}</div>
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
      </div>
    </div>
  );
};

export default PlacePage;
