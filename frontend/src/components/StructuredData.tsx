import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  data: Record<string, unknown>; 
  id?: string;
}

const StructuredData = ({ data, id }: StructuredDataProps) => {
  return (
    <Helmet>
      <script type="application/ld+json" id={id}>
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
};

export default StructuredData;