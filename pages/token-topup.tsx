import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GetServerSideProps } from "next";
import { AppLayout } from "../components/AppLayout";
import { getAppProps } from "@/utils/getAppProps";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

type TokenTopupProps = { availableTokens: number };

export default function TokenTopup({ availableTokens }: TokenTopupProps) {
  const handleClick = async () => {
    const result = await fetch("/api/addTokens", {
      method: "POST",
    });
    const json = await result.json();
    console.log(json);
    console.log("RESULT: ", json);
    window.location.href = json.session.url;
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div>
        <FontAwesomeIcon icon={faCoins} size="3x" className="text-yellow-500" />
      </div>
      <h1>You have {availableTokens} tokens available</h1>
      <p className="mb-4">1 token | 1 blog post</p>
      <button className="btn max-w-xl" onClick={handleClick}>
        Buy 50 Tokens for $10
      </button>
    </div>
  );
}

TokenTopup.getLayout = function getLayout(
  page: React.ReactNode,
  pageProps: any
) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const props = await getAppProps(session!, ctx);

  return {
    props,
  };
};
