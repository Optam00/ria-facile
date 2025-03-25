import React from 'react'

interface TextSettingsProps {
  fontSize: number
  fontFamily: string
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (font: string) => void
}

export const TextSettings: React.FC<TextSettingsProps> = ({
  fontSize,
  fontFamily,
  onFontSizeChange,
  onFontFamilyChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Taille du texte
        </label>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">10px</span>
          <span className="text-sm text-gray-500">13px</span>
          <span className="text-sm text-gray-500">24px</span>
        </div>
        <input
          type="range"
          min="10"
          max="24"
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Police
        </label>
        <select
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="w-full p-2 border rounded-md text-sm"
        >
          <option value="sans">Sans Serif</option>
          <option value="serif">Serif</option>
          <option value="times">Times New Roman</option>
          <option value="mono">Monospace</option>
        </select>
      </div>
    </div>
  )
} 