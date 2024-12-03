"use client";

import { useEffect } from "react";

import { useSearchParams } from "next/navigation";

export default function PatchLocationHash() {
  const params = useSearchParams();

  useEffect(() => {
    const cplt = params.get("cplt");

    if (cplt) {
      window.location.hash = `cplt${cplt}`;
    }
  }, [params]);

  return null;
}
