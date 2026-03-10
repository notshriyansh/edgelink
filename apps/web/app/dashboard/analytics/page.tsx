"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

type LinkType = {
  id: string;
  short_code: string;
  original_url: string;
  clicks: number;
};

export default function AnalyticsOverview() {
  const { getToken } = useAuth();
  const [links, setLinks] = useState<LinkType[]>([]);

  useEffect(() => {
    async function loadLinks() {
      const token = await getToken({ template: "edge" });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setLinks(data.links || []);
    }

    loadLinks();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Overview of link performance
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Short Link</th>
              <th className="text-left p-3">Clicks</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>

          <tbody>
            {links.map((link) => (
              <tr
                key={link.id}
                className="border-t hover:bg-muted/50 transition"
              >
                <td className="p-3 font-mono">{link.short_code}</td>

                <td className="p-3">{link.clicks}</td>

                <td className="p-3">
                  <Link
                    href={`/dashboard/analytics/${link.id}`}
                    className="text-primary hover:underline"
                  >
                    View Analytics →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
