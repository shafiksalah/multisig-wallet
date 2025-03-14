export function Input({ type = "text", placeholder, className, ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`border p-2 rounded ${className}`}
      {...props}
    />
  );
}

