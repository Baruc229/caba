"use client";

interface UserAvatarProps {
  prenom: string;
  nom: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

function getInitials(prenom: string, nom: string): string {
  const p = prenom?.trim().charAt(0) ?? "";
  const n = nom?.trim().charAt(0) ?? "";
  return (p + n).toUpperCase();
}

export function UserAvatar({
  prenom,
  nom,
  avatarUrl,
  size = 28,
  className = "",
}: UserAvatarProps) {
  const initials = getInitials(prenom, nom);
  const fullName = `${prenom} ${nom}`.trim();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        width={size}
        height={size}
        className={`user-avatar ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`user-avatar user-avatar--initials ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
