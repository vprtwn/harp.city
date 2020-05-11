import Head from "next/head";
import Draggable from "react-draggable";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

const PlacePage = (props: any) => {
  const [deltaPosition, setDeltaPosition] = useState({
    x: 0,
    y: 0,
  });

  const {
    query: { place },
  } = useRouter();

  const cellRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e, ui) => {
    const { x, y } = deltaPosition;
    setDeltaPosition({
      x: x + ui.deltaX,
      y: y + ui.deltaY,
    });
  };

  return (
    <div>
      <base target="_blank" />
      <Head>
        <title>{place ?? "harp.city"}</title>
      </Head>
      <div>
        <Draggable
          defaultPosition={{ x: 200, y: 200 }}
          position={null}
          grid={[50, 50]}
          scale={1}
          // onStart={handleStart}
          onDrag={handleDrag}
          // onStop={this.handleStop}
        >
          <div ref={cellRef} className="cell border border-solid border-black">
            <div className="text-xs">{deltaPosition.x.toFixed(0)}</div>
            <div className="text-xs">{deltaPosition.y.toFixed(0)}</div>
          </div>
        </Draggable>
      </div>
    </div>
  );
};

export default PlacePage;
