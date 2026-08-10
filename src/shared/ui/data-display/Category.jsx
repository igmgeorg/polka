export default function Category({ children, tone }) {
  return <span className="mono-cat" data-tone={tone}>[ {children} ]</span>;
}
