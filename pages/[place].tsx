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
      <div className="w-screen">
        <Draggable
          bounds="parent"
          defaultPosition={{ x: 200, y: 200 }}
          position={null}
          grid={[50, 50]}
          scale={1}
          onDrag={handleDrag}
        >
          <div ref={cellRef} className="cell border border-solid border-black">
            <div className="text-xs">{deltaPosition.x.toFixed(0)}</div>
            <div className="text-xs">{deltaPosition.y.toFixed(0)}</div>
          </div>
        </Draggable>
        <div className="h-screen"></div>
        <div className="h-screen"></div>
      </div>
    </div>
  );
};

export default PlacePage;
