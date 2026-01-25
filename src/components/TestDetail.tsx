import TestField from './TestField';
import type { TestModel, VariantModel } from '../services/api';

interface TestDetailProps {
  testData: TestModel;
  onSave: (updated: { name?: string; active?: boolean; description?: string; subpath?: string; variantModels?: VariantModel[] }) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onEndpointDelete?: (endpointId: string) => Promise<void>;
}

export default function TestDetail({ testData, onSave, onDelete }: TestDetailProps) {
  return (
    <div>
      <h3 style={{ color: "black" }}>Test Details</h3>
      <div style={{ marginTop: 8 }}>
        <TestField
          initialName={testData.name}
          initialActive={!!testData.active}
          initialDescription={testData.description}
          initialSubpath={testData.subpath}
          initialVariants={testData.variantModels ?? []}
          onSave={onSave}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
