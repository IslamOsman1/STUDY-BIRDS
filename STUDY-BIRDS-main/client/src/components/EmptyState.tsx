export const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="panel px-6 py-12 text-center">
    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    <p className="mt-3 text-slate-600">{description}</p>
  </div>
);
