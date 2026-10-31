import Icon from "../common/Icon";
import { PRODUCT_COLORS } from "../../data/adminProductsSeed";

const same = (a, b) => a.toLowerCase() === b.toLowerCase();

// Couleur claire ? (pour choisir la couleur de la coche)
function isLight(hex) {
  const value = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

// Choix des couleurs : pastilles à cocher + une couleur personnalisée.
// value : [{ name, hex }]
export default function ProductColorsField({ value, onChange, error }) {
  const custom = value.filter((color) => !PRODUCT_COLORS.some((preset) => same(preset.hex, color.hex)));
  const swatches = [...PRODUCT_COLORS, ...custom];
  const isSelected = (hex) => value.some((color) => same(color.hex, hex));

  const toggle = (color) =>
    onChange(isSelected(color.hex) ? value.filter((item) => !same(item.hex, color.hex)) : [...value, color]);

  const addCustom = (event) => {
    const hex = event.target.value.toUpperCase();
    const preset = PRODUCT_COLORS.find((item) => same(item.hex, hex));
    if (!isSelected(hex)) onChange([...value, preset ?? { name: hex, hex }]);
  };

  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold text-gray-700">Couleurs</legend>
      <div className="flex flex-wrap items-center gap-2.5">
        {swatches.map((color) => {
          const selected = isSelected(color.hex);
          return (
            <label key={color.hex} title={color.name} className="relative cursor-pointer">
              <input type="checkbox" checked={selected} onChange={() => toggle(color)} className="peer sr-only" />
              <span className="sr-only">{color.name}</span>
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition peer-checked:ring-2 peer-checked:ring-law-green peer-checked:ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-gray-900 peer-focus-visible:ring-offset-2"
                style={{ backgroundColor: color.hex }}
              >
                {selected && <Icon name="lucide:check" width={15} className={isLight(color.hex) ? "text-gray-900" : "text-white"} />}
              </span>
            </label>
          );
        })}
        <label title="Ajouter une autre couleur" className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 transition focus-within:ring-2 focus-within:ring-law-green focus-within:ring-offset-2 hover:border-law-green hover:text-law-green">
          <Icon name="lucide:plus" width={15} />
          <span className="sr-only">Ajouter une autre couleur</span>
          <input type="color" onChange={addCustom} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {value.length ? `Sélection : ${value.map((color) => color.name).join(", ")}` : "Aucune couleur sélectionnée"}
      </p>
      {error && <p className="mt-1 text-xs text-law-red">{error}</p>}
    </fieldset>
  );
}
