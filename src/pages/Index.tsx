import { AuthProvider } from '@/hooks/useAuth';
import { NovaApp } from '@/components/nova/NovaApp';

const Index = () => {
  return (
    <AuthProvider>
      <NovaApp />
    </AuthProvider>
  );
};

export default Index;
