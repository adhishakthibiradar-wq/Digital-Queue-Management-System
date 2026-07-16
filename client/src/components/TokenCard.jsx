const TokenCard = ({ title, value, subtitle, footer }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-gray-900">{value ?? "—"}</p>
      {subtitle ? <p className="mt-2 text-sm text-gray-600">{subtitle}</p> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
};

export default TokenCard;