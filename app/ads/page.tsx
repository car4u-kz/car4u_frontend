import { redirect, RedirectType } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Box } from "@mui/material";

import AdsPage from "@/client-pages/ads/ads";

import { SEARCH_QUERY as SQ } from "@/constants";

type SearchParams = Promise<{
  statusId: SQ | undefined;
  templateId?: string | undefined;
}>;

type Props = {
  searchParams: SearchParams;
};

export default async function Ads(props: Props) {
  const searchParams = await props.searchParams;
  const user = await currentUser();
  let statusId = searchParams?.statusId;

  if (!statusId) {
    redirect(`?statusId=${SQ.all}`, RedirectType.replace);
  }
  const emailAddress = user?.primaryEmailAddress?.emailAddress;
  return (
    <Box sx={{ width: "100%", py: 5, px: 15 }}>
      <AdsPage emailAddress={emailAddress!} />
    </Box>
  );
}
