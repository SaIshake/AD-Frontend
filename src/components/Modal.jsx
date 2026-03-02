export default function Modal({ title, subtitle, onClose, children, footer, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-xl', lg: 'max-w-3xl' };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-surface-primary border border-theme rounded-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-theme bg-surface-primary">
          <div>
            <h2 className="text-xl font-bold text-primary tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-secondary mt-1 font-medium">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-secondary hover:text-primary hover:bg-surface-secondary rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-8">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-6 border-t border-theme bg-surface-secondary/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
