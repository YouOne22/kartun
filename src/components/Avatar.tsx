import Image from 'next/image';

type AvatarProps = {
  member: {
    fullName: string;
    avatarUrl: string | null;
    gender?: string | null;
  };
  small?: boolean;
};

/**
 * Reusable avatar component.
 * Renders the member's avatar image if available, otherwise falls back to gender-based default.
 */
export default function Avatar({ member, small = false }: AvatarProps) {
  const sizeClass = small ? 'h-9 w-9' : 'h-14 w-14';
  const defaultAvatar = member.gender === 'P' ? '/female.png' : '/male.png';
  const imgSrc = member.avatarUrl || defaultAvatar;

  return (
    <div className={`${sizeClass} relative flex-shrink-0 overflow-hidden rounded-full`}>
      <Image
        src={imgSrc}
        alt={`Foto ${member.fullName}`}
        fill
        className="object-cover"
        sizes={small ? "36px" : "56px"}
      />
    </div>
  );
}
