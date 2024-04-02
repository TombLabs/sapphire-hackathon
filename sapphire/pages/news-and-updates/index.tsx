import { Separator } from "@/components/ui/separator";
import { getFormatDate } from "@/lib/helpers/utils";
import updatesData from "@/lib/jsons/updates.json";
import { UpdatesType } from "@/types";
import { NextSeo } from "next-seo";

export default function NewsAndUpdatesPage() {
  const updates = updatesData as UpdatesType[];
  return (
    <>
      <NextSeo title="News and Updates" />
      <div className="grid gap-16 max-w-3xl w-full mx-auto py-8 sm:py-16 sm:px-6 px-4">
        <div className="grid gap-2">
          <h1>News and Updates</h1>
          <p className="text-muted-foreground">
            Catch up on the things that have been done to Sapphire over the past
            days.
          </p>
        </div>
        {updates
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((_update) => (
            <article key={_update.timestamp} className="grid gap-6">
              <h3>{getFormatDate(_update.timestamp)}</h3>

              <Separator />

              {_update.whatsNew.length > 0 && (
                <div>
                  <h4>What&apos;s New</h4>
                  <ul className="ml-6 list-disc [&>li]:mt-2">
                    {_update.whatsNew.map((_list, i) => (
                      <li
                        className="text-muted-foreground"
                        key={`${_update.issuesFixed}-whatsnew-${i}`}
                      >
                        {_list}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {_update.comingSoon?.length > 0 && (
                <div>
                  <h4>Coming Soon</h4>
                  <ul className="ml-6 list-disc [&>li]:mt-2">
                    {_update.comingSoon.map((_list, i) => (
                      <li
                        className="text-muted-foreground"
                        key={`${_update.issuesFixed}-commingsoon-${i}`}
                      >
                        {_list}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {_update.issuesFixed.length > 0 && (
                <div>
                  <h4>Issues Fixed</h4>
                  <ul className="ml-6 list-disc [&>li]:mt-2">
                    {_update.issuesFixed.map((_list, i) => (
                      <li
                        className="text-muted-foreground"
                        key={`${_update.issuesFixed}-issues-${i}`}
                      >
                        {_list}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
      </div>
    </>
  );
}
