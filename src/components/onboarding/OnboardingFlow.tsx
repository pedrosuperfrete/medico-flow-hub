
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/contexts/UserContext';
import ClinicInfoStep from './ClinicInfoStep';
import ProfessionalsStep from './ProfessionalsStep';
import AvailabilityStep from './AvailabilityStep';
import PaymentStep from './PaymentStep';

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    clinic: {},
    professionals: [],
    availability: {},
    payment: {}
  });
  const { completeOnboarding } = useUser();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = (stepData: any) => {
    const stepKey = getStepKey(currentStep);
    setFormData(prev => ({
      ...prev,
      [stepKey]: stepData
    }));

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar onboarding
      console.log('Onboarding completed with data:', { ...formData, [stepKey]: stepData });
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepKey = (step: number) => {
    switch (step) {
      case 1: return 'clinic';
      case 2: return 'professionals';
      case 3: return 'availability';
      case 4: return 'payment';
      default: return 'clinic';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ClinicInfoStep onNext={handleNext} initialData={formData.clinic} />;
      case 2:
        return <ProfessionalsStep onNext={handleNext} onBack={handleBack} initialData={formData.professionals} />;
      case 3:
        return <AvailabilityStep onNext={handleNext} onBack={handleBack} initialData={formData.availability} />;
      case 4:
        return <PaymentStep onNext={handleNext} onBack={handleBack} initialData={formData.payment} />;
      default:
        return <ClinicInfoStep onNext={handleNext} initialData={formData.clinic} />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Informações da Clínica';
      case 2: return 'Cadastro de Profissionais';
      case 3: return 'Disponibilidade';
      case 4: return 'Dados de Cobrança';
      default: return 'Configuração Inicial';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              Complete seu Perfil
            </CardTitle>
            <div className="mt-4">
              <div className="flex justify-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Etapa {currentStep} de {totalSteps}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            <h3 className="text-lg font-semibold mt-4">{getStepTitle()}</h3>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
