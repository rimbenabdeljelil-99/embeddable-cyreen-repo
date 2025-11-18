import React, { useState } from 'react';

const GranularityPickerComponent = ({
  defaultGranularity,
  dashboard,
  onPickGranularity,
}: {
  defaultGranularity: string;
  dashboard: string;
  onPickGranularity: (value: string) => void;
}) => {
  const [selectedGranularity, setSelectedGranularity] = useState<string>(defaultGranularity);

  const granularityLabels: { [key: string]: string } = {
    hour: 'Hourly',
    hour_group: 'Hour Group',
    day: 'Daily',
    weekday: 'Weekday',
    week: 'Weekly',
    month: 'Monthly',
    total: 'Total',
  };

  const availableGranularities =
    dashboard === 'overview'
      ? ['day', 'week', 'month'] : dashboard === 'rtg' ? ['hour', 'hour_group', 'day','weekday', 'week', 'month', 'total']
      : ['hour', 'hour_group', 'day','week', 'month', 'total'];

  const handleGranularityChange = (value: string) => {
    setSelectedGranularity(value);
    onPickGranularity(value);
  };

  return (
    <div className="granularity-picker-container">
      <div className="granularity-options">
        {availableGranularities.map((granularity) => (
          <button
            key={granularity}
            className={`granularity-button ${selectedGranularity === granularity ? 'selected' : ''}`}
            onClick={() => handleGranularityChange(granularity)}
          >
            {granularityLabels[granularity]}
          </button>
        ))}
      </div>

      <style jsx>{`
        .granularity-picker-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .granularity-options {
          display: flex;
          gap: 8px;
          justify-content: space-evenly;
          width: 100%;
        }

        .granularity-button {
          height: 80px;
          flex: 1 1 100px;
          min-width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          font-size: 14px;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
          background: linear-gradient(135deg, #f2f2f2, #e6e6e6);
          color: black;
          transition: all 0.3s ease-in-out;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .granularity-button:hover {
          transform: translateY(-2px);
          background: #AF3241;
          color: white;
          box-shadow: 0 6px 12px rgba(175, 50, 65, 0.4);
        }

        .granularity-button.selected {
          background: #AF3241;
          color: white;
          box-shadow: 0 6px 12px rgba(110, 35, 50, 0.5);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default GranularityPickerComponent;