import Head from "next/head";
import Draggable from "react-draggable";
import { useRouter } from "next/router";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_HEIGHT,
  mToNote,
  mToMicroSym,
  mToColor,
  yToM,
  yToFreq,
  yToStringY,
  xToSep,
  xToS,
} from "../utils/transforms";
import React, { useEffect, useRef, useState } from "react";
import Gun from "gun";
import "gun/lib/webrtc";
import Tone from "tone";
import useWindowScroll from "react-use/lib/useWindowScroll";
import useWindowSize from "react-use/lib/useWindowSize";
import useScrolling from "react-use/lib/useScrolling";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";

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

const MAX_SYNTHS = 8;
Konva.pixelRatio = 1;

const PlacePage = (props: any) => {
  const {
    query: { place },
  } = useRouter();

  const [nodes, setNodes] = useState([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedY, setSelectedY] = useState<number | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const scrollRef = React.useRef(null);
  const scrolling = useScrolling(scrollRef);
  const { x: scrollX, y: scrollY } = useWindowScroll();
  const { width: windowW, height: windowH } = useWindowSize();
  const [voices, setVoices] = useState([]);

  if (place && !gunStore) {
    // initGun
    const version = "2020.5.16.0";
    const prefix = `harp.city.${process.env.NODE_ENV}.${version}`;
    const nodeName = `${prefix}^${place || ""}`;
    gunStore = gun.get(nodeName);
    gunStore.map().on((val, msgId) => {
      if (val) {
        nodes[msgId] = {
          x: val.x,
          y: val.y,
        };
      } else {
        nodes[msgId] = null;
      }
      setNodes(JSON.parse(JSON.stringify(nodes)));
    });
  }

  useEffect(() => {
    var vs = [];
    for (let i = 0; i < MAX_SYNTHS; i++) {
      var trem = new Tone.Tremolo({ frequency: 10, depth: 1.0, spread: 0, type: "sawtooth" })
        .toMaster()
        .start();
      var synth = new Tone.MonoSynth({
        oscillator: {
          type: "triangle",
        },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 1,
        },
        volume: -32,
      }).connect(trem);
      vs.push({ synth: synth, tremolo: trem });
    }
    setVoices(vs);
  }, []);

  useEffect(() => {
    if (selected !== null) {
      const node = nodes[selected];
      setSelectedY(node.y);
    } else {
      setSelectedY(null);
    }
    nodes.forEach((n, i) => {
      if (n === null) {
        var voice = voices[i];
        if (!voice) {
          return;
        }
        voice.synth.triggerRelease();
        voices[i] = null;
      } else {
        var voice = voices[i];
        if (!voice) {
          return;
        }
        voice.synth.triggerRelease();
        voice.synth.triggerAttack(yToFreq(n.y), 1.0 / MAX_SYNTHS / 100);
        voice.tremolo.frequency.value = 1.0 / xToS(n.x);
        voices[i] = voice;
      }
    });
  }, [selected, nodes]);

  useEffect(() => {}, [nodes]);

  return (
    <div>
      <base target="_blank" />
      <Head>
        <title>{place ?? "harp.city"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="text-center text-gray-600">
        <div className="p-5 mb-5">{place ?? "harp.city"}</div>
      </div>
      <div ref={scrollRef} className="canvas border border-solid">
        {nodes.map((node, i) => {
          return node ? (
            <Draggable
              defaultClassName="react-draggable absolute"
              key={`cell_${i}`}
              bounds="parent"
              position={{ x: node.x, y: node.y }}
              onDrag={(e, p) => {
                let newNodes = [];
                nodes.forEach((n, index) => {
                  newNodes[index] = n;
                });
                newNodes[i] = {
                  x: p.x,
                  y: p.y,
                };
                setNodes(newNodes);
              }}
              onStart={() => {
                setDragging(true);
              }}
              onStop={(e, d) => {
                let node = nodes[i];
                node.d = false;
                gunStore.get(i).put(node);
                setSelected(i);
                setDragging(false);
              }}
            >
              <div
                className={`cell ${selected === i ? "border-2" : "border"}`}
                style={{
                  borderColor: `${mToColor(yToM(node.y))}`,
                  backgroundColor:
                    selected === i ? `${mToColor(yToM(selectedY))}88` : `transparent`,
                }}
              >
                {/* <span className="text-xs">{yToFreq(node.y).toFixed(2)}</span> */}
                {/* <span className="text-xs">{xToS(node.x).toFixed(2)}</span> */}
              </div>
            </Draggable>
          ) : null;
        })}
        {nodes.map((node, i) => {
          return node ? (
            <div
              key={`string-label_${i}`}
              className="string-label pl-1"
              style={{
                top: `${node.y}px`,
                left: `${scrollX}px`,
                color: `${mToColor(yToM(node.y))}`,
              }}
            >
              <span className="text-xs">{mToNote(yToM(node.y))}</span>
              <sup className="text-xxs">{mToMicroSym(yToM(node.y))}</sup>
            </div>
          ) : null;
        })}

        <div
          hidden={nodes.filter((n) => n !== null).length > MAX_SYNTHS}
          className={`toolbar p-3 ${dragging ? "invisible" : null} z-50`}
        >
          <button
            className="hover:bg-gray-800 text-gray-600 border rounded border-gray-600 text-xl px-5 py-2"
            onClick={() => {
              const y = 100;
              const node = {
                x: 0.5 * windowW + scrollX,
                y: y,
              };
              var addedNode = false;
              nodes.forEach((n, i) => {
                if (addedNode) {
                  return;
                }
                if (n === null) {
                  gunStore.get(i).put(node);
                  setSelected(i);
                  addedNode = true;
                }
              });
              if (!addedNode) {
                const l = nodes.length;
                gunStore.get(l).put(node);
                setSelected(l);
              }
            }}
          >
            +
          </button>
        </div>
        <div className={`fixed p-3 top-0 right-0 ${dragging ? "invisible" : null} z-50`}>
          <button
            hidden={selected === null}
            className="ml-3 hover:bg-gray-800 text-white border-2 rounded border-white text-xl px-5 py-2"
            style={{
              borderColor: mToColor(yToM(selectedY)),
              color: mToColor(yToM(selectedY)),
            }}
            onClick={() => {
              gunStore.get(selected).put(null);
              setSelected(null);
            }}
          >
            –
          </button>
        </div>

        <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} perfectDrawEnabled={false}>
          <Layer perfectDrawEnabled={false}>
            {nodes.map((node, i) => {
              return node ? (
                <Line
                  key={`string_${i}`}
                  points={[0, yToStringY(node.y), CANVAS_WIDTH, yToStringY(node.y)]}
                  stroke={mToColor(yToM(node.y))}
                  strokeWidth={10}
                  dash={[2, xToSep(node.x)]}
                  perfectDrawEnabled={false}
                />
              ) : null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default PlacePage;
