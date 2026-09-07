interface MetaItem {
  label: string;
  value: string;
}

interface ProductMetaGridProps {
  items: MetaItem[];
}

const ProductMetaGrid = ({ items }: ProductMetaGridProps) => (
  <div
    className="grid grid-cols-2 gap-2.5 pt-3 border-t border-gray-200 dark:border-white/[0.06]"
    role="list"
    aria-label="Product details"
  >
    {items.map((item) => (
      <div
        key={item.label}
        className="p-3 rounded-xl bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.07]"
        role="listitem"
      >
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
          {item.label}
        </p>
        <p className="font-bold text-xs truncate text-gray-900 dark:text-white">
          {item.value}
        </p>
      </div>
    ))}
  </div>
);

export default ProductMetaGrid;
