import Head from "next/head";
var Sentencer = require("sentencer");
import Link from "next/link";

const IndexPage = ({ path }) => (
  <div>
    <Head>
      <title>harp.city</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.png" />
    </Head>

    <div className="text-center">
      <div className="p-5 mb-5 text-gray-600">harp.city</div>
      <Link href={`/${path}`}>
        <button className="hover:bg-gray-800 text-white text-xl px-5 py-3 border border-gray-600 rounded">
          ⃞⃤⟁
        </button>
      </Link>
    </div>
  </div>
);

export async function getServerSideProps(context) {
  var path = Sentencer.make("{{ adjective}}-{{ noun }}");
  return {
    props: { path: path }, // will be passed to the page component as props
  };
}

export default IndexPage;
