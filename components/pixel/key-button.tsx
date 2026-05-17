// TODO: Keyboard key shadow button
export function KeyButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="key-button px-4 py-2 text-sm font-display" {...props}>
      {children}
    </button>
  );
}
