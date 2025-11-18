import React, { useEffect, useState } from 'react';
import Container from '../vanilla/Container';
import { translateText } from '../vanilla/translateText';

type Props = {
    title: string;
    onChange: (value: boolean) => void;
    defaultValue?: boolean;
    content?: string;
    clientContext?: {
        language?: string;
    };
};

const ToggleSwitch: React.FC<Props> = ({ title, clientContext,content, onChange, defaultValue = false }) => {
    const [isOn, setIsOn] = useState<boolean>(defaultValue);
    const [labelAbsolute, setLabelAbsolute] = useState<string>('');
    const [labelPercentage, setLabelPercentage] = useState<string>('');
    const language = clientContext?.language;

    const handleToggle = () => {
        const newValue = !isOn;
        setIsOn(newValue);
        onChange(newValue);
    };

    useEffect(() => {
        const translateLabels = async () => {
            if (!language) {
                setLabelAbsolute('Absolute');
                setLabelPercentage('Percentage');
                return;
            }

            try {
                const [abs, perc] = await Promise.all([
                    translateText('Absolute', language),
                    translateText('Percentage', language),
                ]);
                console.log(`Translated Absolute: ${abs}, Percentage: ${perc}`);
                setLabelAbsolute(abs);
                setLabelPercentage(perc);
            } catch (error) {
                console.error("Translation failed:", error);
                setLabelAbsolute('Absolute');
                setLabelPercentage('Percentage');
            }
        };

        translateLabels();
    }, [language]);

    return (
        <Container title={title}>
            <div className="toggle-switch-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                    className={`toggle-switch ${isOn ? 'on' : 'off'}`}
                    onClick={handleToggle}
                    style={{
                        width: '50px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: isOn ? '#a53241' : '#f04b55',
                        position: 'relative',
                        cursor: 'pointer',
                        marginBottom: '10px',
                    }}
                >
                    <div
                        className="toggle-handle"
                        style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: isOn ? 'calc(100% - 22px)' : '2px',
                            transition: 'left 0.2s',
                        }}
                    />
                </div>
                <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                    {content}
                </div>
            </div>
        </Container>
    );
};

export default ToggleSwitch;