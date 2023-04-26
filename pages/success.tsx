import { AppLayout } from "@/components/AppLayout";
import { getAppProps } from "@/utils/getAppProps";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

export default function Success() {
  return (
    <div>
      <h1>Thank you for your purchase!</h1>
    </div>
  );
}

Success.getLayout = function getLayout(page: React.ReactNode, pageProps: any) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const props = await getAppProps(session!, ctx);

  return {
    props,
  };
};
