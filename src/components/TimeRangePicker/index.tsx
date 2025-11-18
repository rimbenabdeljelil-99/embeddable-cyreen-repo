import { Value } from '@embeddable.com/core';
import React, { useState } from 'react';
import { XCircle } from 'lucide-react';

const CustomTimeRangePicker = ({
    onPickTimeRange,
}: {
    onPickTimeRange: (value: { relativeTimeString: string }) => void;
}) => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const handleCustomRangeChange = () => {
        if (startDate && endDate) {
            const customRange = `Custom Range: ${startDate} - ${endDate}`;
            onPickTimeRange({ relativeTimeString: customRange });
        }
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        onPickTimeRange(Value.noFilter());
    };

    return (
        <div className="custom-time-range-picker">
            <div className="custom-range-inputs">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <button onClick={handleCustomRangeChange}>Apply</button>
                <button className="reset-button" onClick={handleReset}>
                    <XCircle size={20} />
                </button>
            </div>

            <style jsx>{`
                .custom-time-range-picker {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 16px;
                    border-radius: 12px;
                    background: #fff;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }

                .custom-range-inputs {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }

                .custom-range-inputs input {
                    padding: 10px;
                    font-size: 14px;
                    border-radius: 6px;
                    border: 1px solid #ccc;
                }

                .custom-range-inputs button {
                    padding: 10px 18px;
                    font-size: 14px;
                    background: #f04b55;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: 0.3s ease-in-out;
                }

                .custom-range-inputs button:hover {
                    background: #d43e47;
                }

                .reset-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #f04b55;
                    transition: 0.3s ease-in-out;
                }

                .reset-button:hover {
                    color: #d43e47;
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
};

export default CustomTimeRangePicker;
