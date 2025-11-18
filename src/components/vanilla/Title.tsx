import React from 'react';

type Props = {
  title?: string;
  style?: React.CSSProperties;
  color?: string
};

export default function Title({ title, style, color }: Props) {
  return (
    !!title && (
      <h2
        className="w-full justify-start flex leading-6 mb-2"
        style={{
          color: color ? color : '#AF3241',
          fontSize: '25px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal',
          alignSelf: 'flex-start',
          ...style, // allow override if needed
        }}
      >
        {title}
      </h2>
    )
  );
}
