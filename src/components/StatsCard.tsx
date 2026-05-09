interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: 'default' | 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export const StatsCard = ({ title, value, subtitle, icon, color = 'default' }: StatsCardProps) => {
  const colorClasses = {
    default: 'text-white',
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    red: 'text-[#E31E24]',
  };

  return (
    <div className="group bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl hover:border-[#E31E24]/40 transition-all duration-300 card-hover relative overflow-hidden">
      <div className="absolute inset-0 bg-[#E31E24]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xs font-ubuntu-medium text-white/60 uppercase tracking-wider">
            {title}
          </h3>
          {icon && (
            <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
              {icon}
            </span>
          )}
        </div>
        <p className={`text-5xl font-ubuntu font-black mb-2 ${colorClasses[color]}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-xs font-ubuntu-light text-white/40 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
