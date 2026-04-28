"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

function initialsFrom(name?: string | null, email?: string | null): string {
  const source = (name ?? email ?? "U").trim();
  if (!source) return "U";
  return source
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar({ name, email, image }: UserAvatarProps) {
  return (
    <Avatar>
      {image ? <AvatarImage src={image} alt={name ?? "Usuario"} /> : null}
      <AvatarFallback>{initialsFrom(name, email)}</AvatarFallback>
    </Avatar>
  );
}
