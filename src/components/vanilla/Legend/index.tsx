import { Dimension } from '@embeddable.com/core';
import React from 'react';
import { DataResponse } from '@embeddable.com/core';

type Props = {
  IdStore?: Dimension;
  results: DataResponse;
  Monitoring?: boolean;
  MonStatus?: boolean;
  Horiz?: boolean;
};

const Legend: React.FC<Props> = ({ IdStore, results, Monitoring, MonStatus, Horiz }) => {
  const storeId = results?.data?.[0]?.[IdStore?.name || 'id_store'];
  const isFerreroStore = Number(storeId) === 163;

  const colors = isFerreroStore
    ? [
        { color: '#006400', label: 'Very Low' },
        { color: '#93C572', label: 'Low' },
        { color: '#F4D03F', label: 'Medium' },
        { color: '#FFA500', label: 'High' },
        { color: '#f04b55', label: 'Very High' }
      ]
    : [
        { color: '#006400', label: 'Low' },
        { color: '#F4D03F', label: 'Medium' },
        { color: '#f04b55', label: 'High' }
      ];

  const receiptStatusColors = [
    { color: '#1e8f4dff', label: 'Receipts processed' },
    { color: '#F4D03F', label: 'Receipts available but not yet processed' },
    { color: '#e74c3c', label: 'Receipts not yet received' }
  ];

  const squareStyle = (color: string) => ({
    width: '14px',
    height: '14px',
    backgroundColor: color,
    marginRight: '8px',
    borderRadius: '2px',
  });

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
  };

  // Determines the container style depending on Horiz prop
  const containerStyle = (horizontal?: boolean) => ({
    display: 'flex',
    flexDirection: horizontal ? 'row' : 'column',
    flexWrap: horizontal ? 'wrap' : 'nowrap',
    gap: horizontal ? '16px' : '0px',
    alignItems: horizontal ? 'center' : 'flex-start'
  });

  return (
    <div style={{
      height: Monitoring ? '180px' : '120px',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px',
      minWidth: isFerreroStore ? '220px' : '160px'
    }}>
      <div style={{
        fontWeight: 'bold',
        marginBottom: '12px',
        color: '#495057',
        fontSize: '15px'
      }}>
        Legend
      </div>

      {Monitoring ? (
        <div style={containerStyle(Horiz)}>
          {receiptStatusColors.map((item, index) => (
            <div key={index} style={labelStyle}>
              <div style={squareStyle(item.color)} />
              {item.label}
            </div>
          ))}
        </div>
      ) : MonStatus ? (
        <div style={containerStyle(Horiz)}>
          {[
            { color: '#1e8f4dff', label: 'Online' },
            { color: '#1770abff', label: 'Closed' },
            { color: '#e74c3c', label: 'Offline' }
          ].map((item, index) => (
            <div key={index} style={labelStyle}>
              <div style={squareStyle(item.color)} />
              {item.label}
            </div>
          ))}
        </div>
      ) : isFerreroStore ? (
        <div style={containerStyle(Horiz)}>
          {colors.map((item, index) => (
            <div key={index} style={labelStyle}>
              <div style={squareStyle(item.color)} />
              {item.label}
            </div>
          ))}
        </div>
      ) : (
        <div style={containerStyle(Horiz)}>
          {colors.map((item, index) => (
            <div key={index} style={labelStyle}>
              <div style={squareStyle(item.color)} />
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Legend;
