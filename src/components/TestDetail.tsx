import React from 'react';
import TestField from './TestField';

interface TestDetailProps {
  domainId: number;
  testId: number;
  testData: { id: number; name: string; active?: boolean };
  onSave: (updated: { name?: string; active?: boolean }) => void;
  onDelete: () => void;
}

export default function TestDetail({ domainId, testId, testData, onSave, onDelete }: TestDetailProps) {
  return (
    <div>
      <h3 style={{ color: "black" }}>Test Details</h3>
      <div style={{ marginTop: 8 }}>
        <TestField initialName={testData.name} initialActive={!!testData.active} onSave={onSave} onDelete={onDelete} />
      </div>
    </div>
  );
}
