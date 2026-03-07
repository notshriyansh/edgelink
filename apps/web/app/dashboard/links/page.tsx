"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

type LinkType = {
  id: string;
  short_code: string;
  original_url: string;
};

export default function LinksPage() {
  const { getToken } = useAuth();

  const [links, setLinks] = useState<LinkType[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function loadLinks() {
      const token = await getToken({ template: "edge" });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setLinks(data.links);
    }

    loadLinks();
  }, []);

  function copyLink(shortCode: string) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${shortCode}`;

    navigator.clipboard.writeText(url);

    setCopied(shortCode);

    setTimeout(() => {
      setCopied(null);
    }, 2000);
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Links</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your shortened links
          </p>
        </div>

        <Link href="/dashboard/new">
          <Button>Create Link</Button>
        </Link>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short URL</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id} className="hover:bg-muted/50">
                <TableCell className="font-mono">{link.short_code}</TableCell>

                <TableCell className="text-muted-foreground max-w-md truncate">
                  {link.original_url}
                </TableCell>

                <TableCell className="flex gap-4">
                  <button
                    onClick={() => copyLink(link.short_code)}
                    className="text-primary text-sm hover:underline"
                  >
                    {copied === link.short_code ? "Copied!" : "Copy"}
                  </button>

                  <Link
                    href={`/dashboard/analytics/${link.id}`}
                    className="text-primary text-sm hover:underline"
                  >
                    Analytics
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
