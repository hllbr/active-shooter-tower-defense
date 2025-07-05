import React from 'react';

interface DiceInfoProps {
  show: boolean;
}

export const DiceInfo: React.FC<DiceInfoProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div style={{ fontSize: 14, color: '#aaa', marginBottom: 12, lineHeight: 1.4 }}>
      <div>💡 <strong>Güçlendirme indirimleri kazanmak ister misin?</strong></div>
      <div style={{ fontSize: 12, marginTop: 4 }}>
        • 1-3: Normal indirimler (%10-30)<br />
        • 4-6: Süper indirimler (%30-50)<br />
        • <strong>Her dalgada sadece 1 hakkın var!</strong>
      </div>
    </div>
  );
}; 