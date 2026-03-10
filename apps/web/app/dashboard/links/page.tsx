"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type LinkType = {
  id: string;
  short_code: string;
  original_url: string;
  clicks: number;
};

export default function LinksPage() {
  const { getToken } = useAuth();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLinks() {
      const token = await getToken({ template: "edge" });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setLinks(data.links || []);
      setLoading(false);
    }

    loadLinks();
  }, []);

  function copyLink(shortCode: string) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${shortCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">My Links</h1>
          <p className="text-sm text-muted-foreground">
            Manage and analyze your shortened links
          </p>
        </div>

        <Link href="/dashboard/new">
          <Button className="hover:scale-105 transition">Create Link</Button>
        </Link>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short URL</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {links.map((link, i) => (
              <motion.tr
                key={link.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-muted/40 transition"
              >
                <TableCell className="font-mono text-primary">
                  {process.env.NEXT_PUBLIC_API_URL}/{link.short_code}
                </TableCell>

                <TableCell className="max-w-md truncate text-muted-foreground">
                  {link.original_url}
                </TableCell>

                <TableCell>
                  <span className="bg-muted px-3 py-1 text-xs rounded-full">
                    {link.clicks}
                  </span>
                </TableCell>

                <TableCell className="flex items-center gap-4">
                  <button
                    onClick={() => copyLink(link.short_code)}
                    className="flex items-center gap-1 text-sm hover:text-primary transition"
                  >
                    <Copy size={14} />
                    Copy
                  </button>

                  <Link
                    href={`/dashboard/analytics/${link.id}`}
                    className="text-sm hover:text-primary transition"
                  >
                    Analytics
                  </Link>

                  <Dialog>
                    <DialogTrigger className="flex items-center gap-1 text-sm hover:text-primary">
                      <QrCode size={14} />
                      QR
                    </DialogTrigger>

                    <DialogContent className="flex flex-col items-center gap-4">
                      <DialogTitle>QR Code</DialogTitle>

                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <QRCodeSVG
                          value={`${process.env.NEXT_PUBLIC_API_URL}/${link.short_code}`}
                          size={200}
                        />
                      </motion.div>

                      <p className="text-sm font-mono text-muted-foreground">
                        {process.env.NEXT_PUBLIC_API_URL}/{link.short_code}
                      </p>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
