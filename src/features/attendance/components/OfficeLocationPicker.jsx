import Input from "@/shared/components/ui/input/Input";

/**
 * Ofis koordinatalari va radius kiritish komponenti
 * @param {{ lat, lng, radius, onLatChange, onLngChange, onRadiusChange }} props
 */
const OfficeLocationPicker = ({ lat, lng, radius, onLatChange, onLngChange, onRadiusChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Kenglik (Latitude)"
          type="number"
          value={lat}
          placeholder="Masalan: 41.299496"
          onChange={onLatChange}
        />
        <Input
          label="Uzunlik (Longitude)"
          type="number"
          value={lng}
          placeholder="Masalan: 69.240073"
          onChange={onLngChange}
        />
      </div>

      <Input
        label="Hudud radiusi (metr)"
        type="number"
        value={radius}
        placeholder="100"
        onChange={onRadiusChange}
      />

      {lat && lng && (
        <p className="text-sm text-gray-500">
          Koordinatalar:{" "}
          <span className="font-mono text-gray-700">
            {lat}, {lng}
          </span>{" "}
          — radius: <span className="font-mono text-gray-700">{radius} m</span>
        </p>
      )}
    </div>
  );
};

export default OfficeLocationPicker;
