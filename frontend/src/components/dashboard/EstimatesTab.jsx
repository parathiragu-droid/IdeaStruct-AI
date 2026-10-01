import EstimatesSection from './EstimatesSection';

export default function EstimatesTab({ blueprint = {} }) {
  const estimates = blueprint.estimates || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <EstimatesSection estimates={estimates} />
    </div>
  );
}
