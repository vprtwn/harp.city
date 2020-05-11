import Head from "next/head";
import { useRouter } from "next/router";

const PlacePage = (props: any) => {
  const {
    query: { place },
  } = useRouter();
  return (
    <div>
      <base target="_blank" />
      <Head>
        <title>{place ?? "harp.city"}</title>
      </Head>
      {place}
    </div>
  );
};

export default PlacePage;
