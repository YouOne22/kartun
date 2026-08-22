type AvatarProps = {
  member: {
    fullName: string;
    avatarUrl: string | null;
    gender?: string | null;
  };
  small?: boolean;
  className?: string;
};

/**
 * Reusable avatar component.
 * Renders the member's avatar image if available, otherwise falls back to gender-based default.
 */
export default function Avatar({ member, small = false, className }: AvatarProps) {
  const sizeClass = small ? 'h-9 w-9' : 'h-14 w-14';
  const defaultAvatar = member.gender === 'P' ? '/female.png' : '/male.png';
  const imgSrc = member.avatarUrl || defaultAvatar;

  return (
    <div className={`${sizeClass} relative rounded-full overflow-hidden ${className || ''}`}>
      <img
        src={imgSrc}
        alt={`Foto ${member.fullName}`}
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (member.avatarUrl) target.src = defaultAvatar;
        }}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
