export default function ProgressBar({ loading }) {
  return (
    <div 
      className={`w-full h-[2px] md:h-[3px] bg-masterly-creamDark rounded-full mt-2 overflow-hidden transition-opacity duration-300 ${
        loading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`h-full bg-masterly-orange rounded-full transition-all duration-300 ${
          loading ? 'w-full animate-shimmer' : 'w-0'
        }`}
        style={{
          backgroundSize: '200% 100%',
          boxShadow: loading ? '0 0 12px rgba(248, 115, 22, 0.35)' : 'none',
          animation: loading ? 'shimmer 2s infinite linear' : 'none',
        }}
      />
    </div>
  );
}
