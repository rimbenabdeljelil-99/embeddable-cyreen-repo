import React, { useState, useEffect } from "react";
import { Dataset, Dimension, DataResponse, Value } from "@embeddable.com/core";
import Loading from "../../util/Loading";
import Error from "../../util/Error";
import { XCircle } from 'lucide-react';

// Props for the dropdown component
type Props = {
    ds: Dataset;
    values: Dimension;
    defaultValue: number;
    results: DataResponse;
    onChange: (value: number) => void;
};

const DropdownComponent = ({ ds, values, defaultValue, results, onChange }: Props) => {
    const { isLoading, data, error } = results;
    const [selectedValue, setSelectedValue] = useState<number>(defaultValue);
    const [fullList, setFullList] = useState<any[]>([]);

    useEffect(() => {
        if (data && data.length > 0) {
            setFullList(data.filter(item => item[values.name] !== null)); // Filter out null values
        }
    }, [data]);

    useEffect(() => {
        setSelectedValue(defaultValue);
    }, [defaultValue]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedValue(Number(value)); // Ensure the value is treated as a number
        onChange(Number(value)); // Trigger the change event with the selected value
    };

    const handleClear = () => {
        setSelectedValue(""); // Reset the selected value
        onChange(316); // Clear selection
    };

    if (isLoading) return <Loading />;
    if (error) return <Error msg={error} />;

    return (
        <div className="dropdown-container">
            <div className="dropdown-wrapper">
                <select
                    className={`dropdown ${!selectedValue ? "placeholder" : ""}`}
                    value={selectedValue}
                    onChange={handleChange}
                >
                    <option value="" disabled hidden>Select campaign...</option>
                    <option value="">Select campaign...</option>
                    {fullList.map((item: any) => (
                        <option key={item[values.name]} value={item[values.name]}>
                            {item[values.name]}
                        </option>
                    ))}
                </select>
                {selectedValue && (
                    <button className="reset-button" onClick={handleClear}>
                        <XCircle size={20} />
                    </button>
                )}
            </div>

            <style jsx>{`
                .dropdown-container {
                    width: 100%;
                    padding: 10px;
                    background-color: #fff;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                }

                .dropdown-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                .dropdown {
                    width: 100%;
                    padding: 12px;
                    font-size: 16px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    appearance: none;
                    cursor: pointer;
                    color: #333;
                }

                .dropdown.placeholder {
                    color: #aaa; /* Lighter color for placeholder */
                }

                .reset-button {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #ff5722;
                    transition: 0.3s ease-in-out;
                }

                .reset-button:hover {
                    color: #e64a19;
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
};


export default DropdownComponent;
