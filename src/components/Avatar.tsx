import Image from 'next/image';

type AvatarProps = {
  member: {
    fullName: string;
    avatarUrl: string | null;
  };
  small?: boolean;
};

/**
 * Reusable avatar component.
 * Renders the member's avatar image if available, otherwise falls back to initials.
 */
export default function Avatar({ member, small = false }: AvatarProps) {
  const sizeClass = small ? 'h-9 w-9' : 'h-14 w-14';
  const textSize = small ? 'text-xs' : 'text-base';
  const initials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase() || '?';

  return member.avatarUrl ? (
    <Image
      src={member.avatarUrl}
      alt={`Foto ${member.fullName}`}
      width={56}
      height={56}
      className={`${sizeClass} rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-teal-700 font-bold text-white ${textSize}`}
    >
      {initials(member.fullName)}
    </div>
  );
}
