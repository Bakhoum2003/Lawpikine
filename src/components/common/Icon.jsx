export default function Icon({ name, width = 20, className = "" }) {
  return (
    <iconify-icon
      icon={name}
      width={width}
      class={className}
      aria-hidden="true"
    />
  );
}
